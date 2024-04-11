import { query } from 'express';
import { pool} from '../database/db.js'
import moment from 'moment';
import { Router } from 'express';
import PDFDocument from "pdfkit-table";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {promisify} from 'util';





// Expresiones regulares globales
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nombreRegex = /^[A-Za-zÁ-Úá-ú\s]+$/;
const apellidoRegex = /^[A-Za-zÁ-Úá-ú]+$/;
const celRegex = /^\d{10}$/;
const addressRegex = /^[A-Za-z0-9\s-]{10,100}$/;

//expresion para terrenos
const idInternoRegex = /^\d+\.\d+\/\d+$/;
const loteRegex = /^\d{1,2}$/;
const manzanaregex = /^[a-zA-Z0-9\s-]+$/;
const dimensionesregex = /^\d+$/;
const precioRegex = /\b\d{1,3}(,\d{3})*(\.\d+)?\b/;
const predialregex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;

// Ventas
const cantidades = /^\d*,?\d+$/;

// abonos
const numeros= /^\d+$/;

export const login=  async(req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    
    if (user && pass) {
        try {
            const [results, fields] = await pool.query('SELECT * FROM users WHERE user = ?', [user]);
            
            if (results.length == 0 || !(await bcrypt.compare(pass, results[0].pass))) {
                console.log('Usuario y/o contraseña incorrectos');
                return res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o contraseña incorrectos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {
                req.session.loggedin = true;
                req.session.name = results[0].name;
                req.session.rol = results[0].rol;
                 
                  const id = results[0].id
                  const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                      expiresIn: process.env.JWT_TIEMPO_EXPIRA
                  })
                 console.log("TOKEN: "+token+" para el USUARIO : "+user)

                 const cookiesOptions = {
                      expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                      httpOnly: true
                 }
                 res.cookie('jwt', token, cookiesOptions)
                if (req.session.rol == 'usuario') {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Propiedad:",
                        alertMessage: "¡SARAHI!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        ruta: ''
                    });
                } else {
                      
                    res.render('login', {
                        alert: true,
                        alertTitle: "Eres larry",
                        alertMessage: "Ata Papa",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        ruta: ''
                    });
                }
            }
        } catch (error) {
            console.error('Error al ejecutar la consulta SQL:', error);
            return res.status(500).send('Error de servidor');
        }
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertecia",
            alertMessage: "Por favor ingrese un usuario y/o contraseña",
            alertIcon: 'warning',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'login'
        });
        res.end();
    }

}

export const auth = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            const results = await pool.query('SELECT * FROM users WHERE id = ?', [decodificada.id]);
            // console.log(results)

            if (results.length > 0) {
                req.user = results[0];
                // console.log( "esto es" , req.user); // Agregar esta línea para verificar



                return next();
            } else {
                throw new Error('Usuario no encontrado');
            }
        } catch (error) {
            console.error(error);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};

export const perfil = async (req, res) => {
    const userId = req.user[0].id; // Accediendo al ID de usuario desde req.user
    console.log(userId); // Solo para verificar en la consola
    
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        res.render('profile', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        res.render('profile', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
    }
};

export const register=  async(req, res) => {
    try {
        if (req.session.rol == 'admin') {
        const { user, name, rol, pass } = req.body;
        
        console.log(req.body)
        // Verificar si algún campo está vacío
        if (!user || !name || !rol || !pass) {
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existingUser = await pool.query('SELECT * FROM users WHERE user = ?', user);
        console.log(existingUser)
        if (existingUser[0].length > 0) {
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario ya existe. Por favor, elija otro nombre de usuario.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // Verificar nombre de usuario
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
        if(!usernameRegex.test(user)){
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario no debe llevar caracteres especiales",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', // Redirigir a la página de registro nuevamente
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            }); 
        }
        // verifica nombre 
        const nombreRegex = /^[A-Za-zÁ-Úá-ú\s]+$/;
        if(!nombreRegex.test(name)){
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El nombre no debe llevar caracteres especiales",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', // Redirigir a la página de registro nuevamente
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            }); 
        }


         // Verificar si la contraseña cumple con los requisitos
         const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
         if (!passwordRegex.test(pass)) {
             return res.render('register', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', // Redirigir a la página de registro nuevamente
                 login: true,
                 roluser: true,
                 name: req.session.name,
                 rol: req.session.rol,
             });
         }

        const passwordHash = await bcrypt.hash(pass, 8);
        await pool.query('INSERT INTO users SET ?', { user, name, rol, pass: passwordHash });
        
        res.render('register', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });
    }else{
        res.render('register', {
            alert: true,
            alertTitle: "ERROR",
            alertMessage: "NO TIENES ACCESO!",
            alertIcon: 'error',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
        });
    }
    } catch (error) {
        console.error(error);
        // Manejar el error apropiadamente
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

// vista 
export const usuarios=  async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('usuarios', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT *FROM users');
        res.render('usuarios', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows
        });
    }
}
export const editarUsuario = async (req, res) => {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM users WHERE id=?',[id]);

    if (req.session.rol == 'admin') {
        const { user, name, rol } = req.body;

        // Verificar si algún campo está vacío
        if (!user || !name || !rol) {
            return res.render('editar', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
            });
        }

        // Verificar si el nombre de usuario ha sido modificado
        const usuarioModificado = user !== rows[0].user;

        // Si el nombre de usuario ha sido modificado, verificar si ya existe en la base de datos
        if (usuarioModificado) {
            const existingUser = await pool.query('SELECT * FROM users WHERE user = ?', [user]);
            if (existingUser[0].length > 0) {
                return res.render('editar', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El usuario ya existe. Por favor, elija otro nombre de usuario.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    usuarios:rows,
                });
            }
        }
        // Verificar nombre de usuario
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
        if(!usernameRegex.test(user)){
            return res.render('editar', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario no debe llevar caracteres especiales",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', // Redirigir a la página de registro nuevamente
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,

            }); 
        }
        // verifica nombre 
        const nombreRegex = /^[A-Za-zÁ-Úá-ú\s]+$/;
        if(!nombreRegex.test(name)){
            return res.render('editar', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El nombre no debe llevar caracteres especiales",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', // Redirigir a la página de registro nuevamente
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,

            }); 
        }

        // Si el usuario no ha sido modificado o no existe en la base de datos, continuar con la actualización
        const [result] = await pool.query('UPDATE users SET name = IFNULL (?, name), user = IFNULL (?, user), rol = IFNULL (?, rol) WHERE id = ?', [name, user, rol, id]);

        // Verificar si la actualización fue exitosa
        if (result && result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM users');
            res.render('usuarios', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitosa!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
                ruta: 'usuarios'
            });
        } else {
            // Si no se actualizó ninguna fila, mostrar un mensaje de error
            res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "No se pudo actualizar el usuario.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
            });
        }
    } else {
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}


export const eliminarUsuario = async (req, res) => {
     if (req.session.rol == 'admin') {
        const { id } = req.params;
        const [result]=await pool.query('DELETE FROM users WHERE id=?',[id])
        //otro if de si es mayor a 0?
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM users');
        res.render('usuarios', {
            alert: true,
            alertTitle: "Eliminado",
            alertMessage: "¡Eliminado Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios:rows,
            ruta:'usuarios'
        });
    } }else{
        // (error) 
        //     console.error(error);
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
    }


    // CLIENTES
export const crearCliente = async (req, res) => {
        try {
            const { name, a_paterno, a_materno, cel, adress, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge } = req.body;
            const validName = nombreRegex.test(name);
            // Validar el formato de los apellidos permitiendo espacios en blanco
            const validApellido = apellidoRegex.test(a_paterno);
            const validMaterno = apellidoRegex.test(a_materno);
            // Validar el formato del número de celular
            const validCel = celRegex.test(cel);
            const validAdress = addressRegex.test(adress);

            if (req.session.rol == 'admin') {

                // console.log(req.body);
                // Verificar si algún campo obligatorio está vacío
                if (!name || !a_paterno || !a_materno || !cel || !adress) {
    
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Debes rellenar todos los campos!",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
        
            
                if (!validName) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del nombre es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
                
        
                if (!validApellido || !validMaterno) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del apellido paterno o materno es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
        
              
                if (!validCel) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del número de celular es inválido. Debe tener 10 dígitos.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
    
                // Validar el formato de la dirección
                if (!validAdress) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato de dirección es inválido. No debe tener caracteres especiales.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
    
                // Validar el formato del nombre, apellido paterno, apellido materno y número de celular del cónyuge
                if (name_conyuge || a_paterno_conyuge || a_materno_conyuge || cel_conyuge) {
                    const validNameConyuge = nombreRegex.test(name_conyuge);
                    const validApellidoConyuge = apellidoRegex.test(a_paterno_conyuge);
                    const validMaternoConyuge = apellidoRegex.test(a_materno_conyuge);
                    const validCelConyuge = celRegex.test(cel_conyuge);
    
                    if (!validNameConyuge) {
                        return res.render('registro', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del nombre del cónyuge es inválido. Por favor, solo letras.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: '/', 
                            login: true,
                            roluser: true,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
    
                    if (!validApellidoConyuge || !validMaternoConyuge) {
                        return res.render('registro', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del apellido paterno o materno del cónyuge es inválido.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 5000,
                            ruta: '/', 
                            login: true,
                            roluser: true,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
    
                    if (!validCelConyuge) {
                        return res.render('registro', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del número de teléfono del cónyuge es inválido.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 5000,
                            ruta: '/', 
                            login: true,
                            roluser: true,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
                }
    
                // Continuar con la inserción en la base de datos si todos los campos son válidos
                const ejemplo = await pool.query('INSERT INTO customers SET ?', { name, a_paterno, a_materno, cel, adress });
        
                if (ejemplo) {
                    const [rows] = await pool.query('SELECT * FROM customers WHERE name = ? AND a_paterno = ? AND a_materno = ?', [name, a_paterno, a_materno]);
                    // Si hubo un registro se detiene y toma el id del cliente y se inserta más información en parentesco 
                    if (rows.length > 0) {
                        const customer_id = rows[0].id;
                        if (name_conyuge || a_paterno_conyuge || a_materno_conyuge || cel_conyuge) {
                            await pool.query('INSERT INTO parentesco SET ?', { customer_id, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge });
                        }
                        
                        // Renderizar vista // renderizarRegistro(req, res);
                        res.render('registro', {
                            alert: true,
                            alertTitle: "Registro",
                            alertMessage: "¡Registro Exitoso!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: '/',
                            login: true,
                            roluser: true,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
                }
            }  else if (req.session.rol == 'usuario') {

         
                if (!name || !a_paterno || !a_materno || !cel || !adress) {
    
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Debes rellenar todos los campos!",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: '/', 
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
        
            
                if (!validName) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del nombre es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
                
        
                if (!validApellido || !validMaterno) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del apellido paterno o materno es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
        
              
                if (!validCel) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del número de celular es inválido. Debe tener 10 dígitos.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
    
                // Validar el formato de la dirección
                if (!validAdress) {
                    return res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato de dirección es inválido. No debe tener caracteres especiales.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                    });
                }
    
                // Validar el formato del nombre, apellido paterno, apellido materno y número de celular del cónyuge
                if (name_conyuge || a_paterno_conyuge || a_materno_conyuge || cel_conyuge) {
                    const validNameConyuge = nombreRegex.test(name_conyuge);
                    const validApellidoConyuge = apellidoRegex.test(a_paterno_conyuge);
                    const validMaternoConyuge = apellidoRegex.test(a_materno_conyuge);
                    const validCelConyuge = celRegex.test(cel_conyuge);
    
                    if (!validNameConyuge) {
                        return res.render('registro', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del nombre del cónyuge es inválido. Por favor, solo letras.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
    
                    if (!validApellidoConyuge || !validMaternoConyuge) {
                        return res.render('registro', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del apellido paterno o materno del cónyuge es inválido.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 5000,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
    
                    if (!validCelConyuge) {
                        return res.render('registro', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del número de teléfono del cónyuge es inválido.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 5000,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
                }
    
                // Continuar con la inserción en la base de datos si todos los campos son válidos
                const ejemplo = await pool.query('INSERT INTO customers SET ?', { name, a_paterno, a_materno, cel, adress });
        
                if (ejemplo) {
                    const [rows] = await pool.query('SELECT * FROM customers WHERE name = ? AND a_paterno = ? AND a_materno = ?', [name, a_paterno, a_materno]);
                    // Si hubo un registro se detiene y toma el id del cliente y se inserta más información en parentesco 
                    if (rows.length > 0) {
                        const customer_id = rows[0].id;
                        if (name_conyuge || a_paterno_conyuge || a_materno_conyuge || cel_conyuge) {
                            await pool.query('INSERT INTO parentesco SET ?', { customer_id, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge });
                        }
                        
                        // Renderizar vista // renderizarRegistro(req, res);
                        res.render('registro', {
                            alert: true,
                            alertTitle: "Registro",
                            alertMessage: "¡Registro Exitoso!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: '/',
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                        });
                    }
                }
            }
            else {
                // El rol no es válido
                res.status(403).send('Acceso denegado');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        }
    };
    
 export const editarClientes = async (req, res) => {
        try {

            const id = req.params.id;
            const [rows] =await pool.query('SELECT c.*, p.name_conyuge, p.a_paterno_conyuge, p.a_materno_conyuge, p.cel_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id WHERE c.id = ?', [id]);

            if ( req.session.rol == 'admin') {
                const { id } = req.params;
                const { name, a_paterno, a_materno, cel, adress, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge } = req.body;
                console.log(req.body.cel);

                // Verificar si algún campo está vacío
                    if (!name || !a_paterno || !a_materno || !cel || !adress) {
                        return res.render('clienteEdit', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "Debes rellenar todos los campos!",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: '/', 
                            login: true,
                            roluser: true,
                            name: req.session.name,
                            rol: req.session.rol,
                            clientes: rows,
                        });
                    }
    
                        // Validar el formato del nombre permitiendo espacios en blanco
                const validName = nombreRegex.test(name);

                if (!validName) {
                    return res.render('clienteEdit', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del nombre es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                    });
                }

                const validApellido = apellidoRegex.test(a_paterno);
                const validMaterno = apellidoRegex.test(a_materno);
    

                if (!validApellido || !validMaterno) {
                    return res.render('clienteEdit', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del apellidos es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                    });
                }
                 // Validar el formato del número de celular
        
                 const validCel = celRegex.test(cel);
            
                 if (!validCel) {
                     return res.render('clienteEdit', {
                         alert: true,
                         alertTitle: "Error",
                         alertMessage: "El formato del número de celular es inválido. Debe tener 10 dígitos.",
                         alertIcon: 'error',
                         showConfirmButton: false,
                         timer: 3500,
                         ruta: '/', 
                         login: true,
                         roluser: true,
                         name: req.session.name,
                         rol: req.session.rol,
                         clientes: rows,
                     });
                 }
    
                       //validar formato de dirección 
            const validAdress=addressRegex.test(adress);
            if (!validAdress) {
                return res.render('clienteEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El formato de dirección inválido. No debe tener caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                });
            }
            if (name_conyuge.trim() !== '' || a_paterno_conyuge.trim() !== '' || a_materno_conyuge.trim() !== '' || cel_conyuge.trim() !== '') {
            
                const validNameConyuge = nombreRegex.test(name_conyuge);
                const validApellidoConyuge = apellidoRegex.test(a_paterno_conyuge);
                const validMaternoConyuge = apellidoRegex.test(a_materno_conyuge);
                const validCelConyuge = celRegex.test(cel_conyuge);

                if (!validNameConyuge) {
                    return res.render('clienteEdit', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del nombre del cónyuge es inválido. Por favor, solo letras.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/',
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                    });
                }

                if (!validApellidoConyuge || !validMaternoConyuge) {
                    return res.render('clienteEdit', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del apellido paterno o materno del cónyuge es inválido.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 5000,
                        ruta: '/',
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                    });
                }

                if (!validCelConyuge) {
                    return res.render('clienteEdit', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El formato del número de celular del cónyuge es inválido.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 5000,
                        ruta: '/',
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                    });
                }
            }  
                // Actualizar los datos del cliente en la tabla customers
                const [result] = await pool.query('UPDATE customers SET name = IFNULL (?, name), a_paterno = IFNULL (?, a_paterno), a_materno = IFNULL (?, a_materno), cel = IFNULL (?, cel), adress= IFNULL (?, adress) WHERE id = ?', [name, a_paterno, a_materno, cel, adress, id]);
                // console.log(result);

                // Verificar si la actualización fue exitosa
                if (result && result.affectedRows > 0) {
                    // Verificar si el cliente ya tiene un registro en la tabla parentesco
                    const [existingParentesco] = await pool.query('SELECT * FROM parentesco WHERE customer_id = ?', [id]);
    
                    if (existingParentesco && existingParentesco.length > 0) {
                        // Si existe un registro en la tabla parentesco, actualizarlo
                        await pool.query('UPDATE parentesco SET name_conyuge = ?, a_paterno_conyuge = ?, a_materno_conyuge = ?, cel_conyuge = ? WHERE customer_id = ?', [name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge, id]);
                    } else {
                        // Si no existe un registro en la tabla parentesco, insertar uno nuevo
                        await pool.query('INSERT INTO parentesco SET ?', { customer_id: id, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge });
                    }
    
                    // Obtener los datos actualizados del cliente
                    const [clientes] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    
                    // Renderizar la vista
                    res.render('clientes', {
                        alert: true,
                        alertTitle: "Actualización",
                        alertMessage: "¡Actualización Exitoso",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: clientes,
                        ruta: 'clientes'
                    });
                } else {
                    // La actualización no fue exitosa
                    res.status(500).send('Error interno del servidor');
                }


            } 

            else if (req.session.rol == 'usuario') {
                const { id } = req.params;
                const { name, a_paterno, a_materno, cel, adress, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge } = req.body;
                    // Verificar si algún campo está vacío
                    if (!name || !a_paterno || !a_materno || !cel || !adress) {
                        return res.render('clienteEdit', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "Debes rellenar todos los campos!",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                            clientes: rows,
                        });
                    }

                    // Validar el formato del nombre permitiendo espacios en blanco
                    const validName = nombreRegex.test(name);
                    if (!validName) {
                        return res.render('clienteEdit', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del nombre es inválido. Por favor, solo letras.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                            clientes: rows,
                        });
                    }
                    const validApellido = apellidoRegex.test(a_paterno);
                    const validMaterno = apellidoRegex.test(a_materno);
                    if (!validApellido || !validMaterno) {
                        return res.render('clienteEdit', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del apellidos es inválido. Por favor, solo letras.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                            clientes: rows,
                        });
                    }
                    const validCel = celRegex.test(cel);
                    if (!validCel) {
                        return res.render('clienteEdit', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato del número de celular es inválido. Debe tener 10 dígitos.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                            clientes: rows,
                        });
                    }
                    const validAdress=addressRegex.test(adress);
                    if (!validAdress) {
                        return res.render('clienteEdit', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El formato de dirección inválido. No debe tener caracteres especiales.",
                            alertIcon: 'error',
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: '/', 
                            login: true,
                            roluser: false,
                            name: req.session.name,
                            rol: req.session.rol,
                            clientes: rows,
                        });
                    }

                    if (name_conyuge.trim() !== '' || a_paterno_conyuge.trim() !== '' || a_materno_conyuge.trim() !== '' || cel_conyuge.trim() !== '') {
            
                        const validNameConyuge = nombreRegex.test(name_conyuge);
                        const validApellidoConyuge = apellidoRegex.test(a_paterno_conyuge);
                        const validMaternoConyuge = apellidoRegex.test(a_materno_conyuge);
                        const validCelConyuge = celRegex.test(cel_conyuge);
        
                        if (!validNameConyuge) {
                            return res.render('clienteEdit', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "El formato del nombre del cónyuge es inválido. Por favor, solo letras.",
                                alertIcon: 'error',
                                showConfirmButton: false,
                                timer: 3500,
                                ruta: '/',
                                login: true,
                                roluser: false,
                                name: req.session.name,
                                rol: req.session.rol,
                                clientes: rows,
                            });
                        }
        
                        if (!validApellidoConyuge || !validMaternoConyuge) {
                            return res.render('clienteEdit', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "El formato del apellido paterno o materno del cónyuge es inválido.",
                                alertIcon: 'error',
                                showConfirmButton: false,
                                timer: 5000,
                                ruta: '/',
                                login: true,
                                roluser: false,
                                name: req.session.name,
                                rol: req.session.rol,
                                clientes: rows,
                            });
                        }
        
                        if (!validCelConyuge) {
                            return res.render('clienteEdit', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "El formato del número de celular del cónyuge es inválido.",
                                alertIcon: 'error',
                                showConfirmButton: false,
                                timer: 5000,
                                ruta: '/',
                                login: true,
                                roluser: false,
                                name: req.session.name,
                                rol: req.session.rol,
                                clientes: rows,
                            });
                        }
                    }
         
                    
                // Actualizar los datos del cliente en la tabla customers
                const [result] = await pool.query('UPDATE customers SET name = IFNULL (?, name), a_paterno = IFNULL (?, a_paterno), a_materno = IFNULL (?, a_materno), cel = IFNULL (?, cel), adress= IFNULL (?, adress) WHERE id = ?', [name, a_paterno, a_materno, cel, adress, id]);
    
                // Verificar si la actualización fue exitosa
                if (result && result.affectedRows > 0) {
                    // Verificar si el cliente ya tiene un registro en la tabla parentesco
                    const [existingParentesco] = await pool.query('SELECT * FROM parentesco WHERE customer_id = ?', [id]);
    
                    if (existingParentesco && existingParentesco.length > 0) {
                        // Si existe un registro en la tabla parentesco, actualizarlo
                        await pool.query('UPDATE parentesco SET name_conyuge = ?, a_paterno_conyuge = ?, a_materno_conyuge = ?, cel_conyuge = ? WHERE customer_id = ?', [name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge, id]);
                    } else {
                        // Si no existe un registro en la tabla parentesco, insertar uno nuevo
                        await pool.query('INSERT INTO parentesco SET ?', { customer_id: id, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge });
                    }
    
                    // Obtener los datos actualizados del cliente
                    const [clientes] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    
                    // Renderizar la vista
                    res.render('clientes', {
                        alert: true,
                        alertTitle: "Actualización",
                        alertMessage: "¡Actualización Exitoso",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: clientes,
                        ruta: 'clientes'
                    });
                } 

            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        }
    };

    
export const eliminarCliente = async (req, res) => {
        if (req.session.rol == 'admin') {
            const { id } = req.params;
            try {
                // Eliminar registros relacionados en la tabla parentezco
                await pool.query('DELETE FROM parentesco WHERE customer_id = ?', [id]);
                
                // Eliminar el cliente de la tabla customers
                const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
                if (result && result.affectedRows > 0) {
                    const [rows] = await pool.query('SELECT * FROM customers');
                    res.render('clientes', {
                        alert: true,
                        alertTitle: "Eliminado",
                        alertMessage: "¡Eliminado Exitoso!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                        ruta: 'clientes'
                    });
                } else {
                    res.status(404).send('Cliente no encontrado');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Error interno del servidor');
            }
        } else {
            res.status(403).send('Acceso denegado');
        }
    };
    


// terreno
export const crearTerreno= async (req, res) => {
    try {
        const { id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        console.log(req.body);
        // Convertir el precio a un número entero
        // const precioTerreno = parseFloat(precio);
        if (req.session.rol == 'admin') {
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
        console.log(existinid_interno)
        if (existinid_interno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const idInternoRegex = /^\d+(\.\d+)?(\/\d+)?$/;
        // const idInternoRegex = /^\d+\.\d+\/\d+$/;

        const validID = idInternoRegex.test(id_interno);
        
        if (!validID) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato del id_interno es inválido.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 5000,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
        
            });
        }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        // const loteRegex = /^\d{1,2}$/;
        const validLote=loteRegex.test(lote);
        if (!validLote) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

        if (existTerreno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/',
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }


        // const manzanaregex = /^[a-zA-Z0-9\s-]+$/;
        const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const dimensionesregex = /^\d+$/;

        const validDimensiones=dimensionesregex.test(superficie)
        if (!validDimensiones) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const precioRegex = /\b\d{1,3}(,\d{3})*(\.\d+)?\b/;
        const validPrecio=precioRegex.test(precio);
           if (!validPrecio) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
        console.log(existpredial)
        if (existpredial[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El número de predial ya existe. Por favor, verifique números",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const predialregex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
        const validPredial=predialregex.test(predial);
               if (!validPredial) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de predial inválido. Debe llevar separador (-)",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        await pool.query('INSERT INTO land SET ?', { id_interno, calle, lote, manzana,superficie,precio: precioTerreno,predial,escritura,estado });
        
        res.render('terrenoAlta', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });

    }
    if (req.session.rol == 'usuario') {
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,

            });
        }
        const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
        console.log(existinid_interno)
        if (existinid_interno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const idInternoRegex = /^\d+(\.\d+)?(\/\d+)?$/;
        // const idInternoRegex = /^\d+\.\d+\/\d+$/;

        const validID = idInternoRegex.test(id_interno);
        
        if (!validID) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato del id_interno es inválido.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 5000,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
        
            });
        }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        // const loteRegex = /^\d{1,2}$/;
        const validLote=loteRegex.test(lote);
        if (!validLote) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

        if (existTerreno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/',
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }


        // const manzanaregex = /^[a-zA-Z0-9\s-]+$/;
        const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const dimensionesregex = /^\d+$/;

        const validDimensiones=dimensionesregex.test(superficie)
        if (!validDimensiones) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const precioRegex = /\b\d{1,3}(,\d{3})*(\.\d+)?\b/;
        const validPrecio=precioRegex.test(precio);
           if (!validPrecio) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
        console.log(existpredial)
        if (existpredial[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El número de predial ya existe. Por favor, verifique números",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const predialregex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
        const validPredial=predialregex.test(predial);
               if (!validPredial) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de predial inválido. Debe llevar separador (-)",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        await pool.query('INSERT INTO land SET ?', { id_interno, calle, lote, manzana,superficie,precio: precioTerreno,predial,escritura,estado });
        
        res.render('terrenoAlta', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
        });

        
    }

    } catch (error) {
        console.error(error);
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}


export const editarTerrenos = async (req, res) => {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM land WHERE id=?',[id]);

    if (req.session.rol == 'usuario') {
        const { id } = req.params;
        const {id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

     const idInternoModificado = req.body.id_interno !== rows[0].id_interno;
     if (idInternoModificado) {
         // Validar formato de id_interno
         const validIdInterno = idInternoRegex.test(id_interno);
         if (!validIdInterno) {
              return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
         }

         const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
         if (existinid_interno[0].length > 0) {
             return res.render('terrenosEdit', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', 
                 login: true,
                 roluser: false,
                 name: req.session.name,
                 rol: req.session.rol,
                 terrenos: rows,
             });
         }
     }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

      
            // Verificar si el lote o la manzana han sido modificados
        const loteModificado = req.body.lote !== rows[0].lote;
        if (loteModificado) {
            const validLote=loteRegex.test(lote);
            if (!validLote) {
                return res.render('terrenosEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/', 
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    terrenos: rows,
                });
            }
            
            
        }
        const manzanaModificada = req.body.manzana !== rows[0].manzana;
        if (manzanaModificada) {
            const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

// Realizar la validación solo si el lote o la manzana han sido modificados
        if (existTerreno[0].length > 0) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

        }


     const validDimensiones=dimensionesregex.test(superficie)
     if (!validDimensiones) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: false,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     const validPrecio = precioRegex.test(precio) && !isNaN(parseFloat(precio.replace(',', '')));
     if (!validPrecio) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: false,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     
       // Agregar lógica para verificar si el id_interno ha sido modificado
       const predialModificado = req.body.predial !== rows[0].predial;
       if (predialModificado) {
         
           const validpredial = predialregex.test(predial);
           if (!validpredial) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El formato de predial es inválido.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: false,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
  
           const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
           if (existpredial[0].length > 0) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El predial ya existe. Por favor, verifique.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: false,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
       }

        const [result] = await pool.query('UPDATE land SET id_interno = ?, calle = ?, lote = ?, manzana = ?, superficie = ?, precio = ?, predial = ?, escritura = ?, estado = ? WHERE id = ?', [id_interno, calle, lote, manzana, superficie, precioTerreno, predial, escritura, estado, id]);
        
        // Si el id_interno no ha sido modificado o no existe en la base de datos, proceder con la actualización
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM land');
            res.render('terrenos', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos:rows,
                ruta:'terrenos'
            });


   }} else if (req.session.rol == 'admin') {
    const { id } = req.params;
        const {id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

       
     // Agregar lógica para verificar si el id_interno ha sido modificado
     const idInternoModificado = req.body.id_interno !== rows[0].id_interno;
     if (idInternoModificado) {
         // Validar formato de id_interno
         const validIdInterno = idInternoRegex.test(id_interno);
         if (!validIdInterno) {
             return res.render('terrenosEdit', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "El formato de id_interno es inválido.",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', 
                 login: true,
                 roluser: true,
                 name: req.session.name,
                 rol: req.session.rol,
                 terrenos: rows,
             });
         }

         const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
         if (existinid_interno[0].length > 0) {
             return res.render('terrenosEdit', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', 
                 login: true,
                 roluser: true,
                 name: req.session.name,
                 rol: req.session.rol,
                 terrenos: rows,
             });
         }
     }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

      
            // Verificar si el lote o la manzana han sido modificados
        const loteModificado = req.body.lote !== rows[0].lote;
        if (loteModificado) {
            const validLote=loteRegex.test(lote);
            if (!validLote) {
                return res.render('terrenosEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    terrenos: rows,
                });
            }
            
            
        }
        const manzanaModificada = req.body.manzana !== rows[0].manzana;
        if (manzanaModificada) {
            const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

// Realizar la validación solo si el lote o la manzana han sido modificados
if (existTerreno[0].length > 0) {
    return res.render('terrenosEdit', {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
        alertIcon: 'error',
        showConfirmButton: false,
        timer: 3500,
        ruta: '/', 
        login: true,
        roluser: true,
        name: req.session.name,
        rol: req.session.rol,
        terrenos: rows,
    });
}

        }

  



     const validDimensiones=dimensionesregex.test(superficie)
     if (!validDimensiones) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: true,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     const validPrecio = precioRegex.test(precio) && !isNaN(parseFloat(precio.replace(',', '')));
     if (!validPrecio) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: true,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     
       // Agregar lógica para verificar si el id_interno ha sido modificado
       const predialModificado = req.body.predial !== rows[0].predial;
       if (predialModificado) {
         
           const validpredial = predialregex.test(predial);
           if (!validpredial) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El formato de predial es inválido.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: true,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
  
           const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
           if (existpredial[0].length > 0) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El predial ya existe. Por favor, verifique.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: true,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
       }


       


        // const [result] = await pool.query('UPDATE land SET id_interno  = IFNULL (?, id_interno), calle = IFNULL (?, calle), lote = IFNULL (?, lote), manzana = IFNULL (?, manzana), superficie = IFNULL (?, superficie), precio= IFNULL (?, precio), predial= IFNULL (?, predial), escritura= IFNULL (?, escritura), estado= IFNULL (?, estado)  WHERE id = ?', [id_interno, calle, lote, manzana,superficie, precio, predial, escritura, estado, id]);

        const [result] = await pool.query('UPDATE land SET id_interno = ?, calle = ?, lote = ?, manzana = ?, superficie = ?, precio = ?, predial = ?, escritura = ?, estado = ? WHERE id = ?', [id_interno, calle, lote, manzana, superficie, precioTerreno, predial, escritura, estado, id]);
        
        // Si el id_interno no ha sido modificado o no existe en la base de datos, proceder con la actualización
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM land');
            res.render('terrenos', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                terrenos:rows,
                ruta:'terrenos'
            });
        }
   } 
}


// ELIMINAR TERRENO

export const eliminarTerreno = async (req, res) => {

    if (req.session.rol == 'admin') {
        const { id } = req.params;
        const [result]=await pool.query('DELETE FROM land WHERE id=?',[id])
    //otro if de si es mayor a 0?
    if (result && result.affectedRows > 0) {
        const [rows]=await pool.query('SELECT * FROM land');
    res.render('terrenos', {
        alert: true,
        alertTitle: "Eliminado",
        alertMessage: "¡Eliminado Exitoso",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 1500,
        login: true,
        roluser: true,
        name: req.session.name,
        rol: req.session.rol,
        terrenos:rows,
        ruta:'terrenos'
    });
} }else{
    // (error) 
    //     console.error(error);
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}


// venta crear
const crearVenta = async (req, res) => {
    const terrenoId = req.params.id;
    const [terreno] = await pool.query('SELECT * FROM land WHERE id = ?', [terrenoId]);
    const [rows] = await pool.query('SELECT * FROM customers');
    const [rows2] = await pool.query('SELECT * FROM land WHERE estado = ?', ['disponible']);
    
    const vendedor = req.session.name;
    
    try {
        const { id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas, cuotas, precio} = req.body;

        const inicialNumber = parseFloat(inicial);
        const nCuentasNumber = parseFloat(n_cuentas);

    
        const deuda_restante = precio - inicial;

        

        // Verificar si algún campo está vacío o si los valores de 'inicial' y 'n_cuentas' no son números válidos
        if (!id_customer || !id_land || !fecha_venta || !tipo_venta) {
            return res.render('ventas', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos obligatorios.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 5000,
                ruta: '/',
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        }

        // Formatear fecha
        const fechaFormateada = moment(fecha_venta).format('YYYY-MM-DD');
  
        if (tipo_venta === 'credito') {
            if(inicialNumber <= 0 || !cantidades.test(inicial)) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de inicial son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            }

            if(nCuentasNumber <= 0 || !cantidades.test(n_cuentas)) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de n_cuentas son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            }
        }
         // Validar que el enganche no sea igual o mayor que el precio del terreno
         if (inicialNumber >= precio) {
            return res.render('ventas', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "La cantidad del enganche debe ser menor que el precio del terreno.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/',
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        }


        // Insertar venta en la base de datos según el tipo de venta
        if (tipo_venta === 'contado') {
            // Insertar venta en la base de datos
            await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, vendedor) VALUES (?, ?, ?, ?, ?)', [id_customer, id_land, fechaFormateada, tipo_venta, vendedor]);

            // Marcar el terreno como "pagado"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_land]);
        } else if (tipo_venta === 'credito') {
            // Insertar venta a crédito en la base de datos
           const ventasearch = await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas, vendedor, cuotas, deuda_restante) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id_customer, id_land, fechaFormateada, tipo_venta, inicial, n_cuentas, vendedor, cuotas, deuda_restante]);

            // Marcar el terreno como "proceso"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['proceso', id_land]);

            if(ventasearch){
               const [ventasrows] =  await pool.query('SELECT * FROM sale WHERE id_land = ? ', [id_land]);

             await pool.query('INSERT INTO abonos (id_sale, cuotas_restantes, fecha_abono) VALUES (?, ?, ?)', [ventasrows[0].id, n_cuentas, fechaFormateada ]);

            }
        }

        return res.render('ventas', {
            alert: true,
            alertTitle: "Exito",
            alertMessage: "Venta registrada!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'ventas',
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
            terrenos: rows2,
            terrenos2: terreno,
        });
  
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}


const editarVenta = async (req, res) => {
    // re dirigir
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, l.id_interno, s.fecha_venta, s.n_cuentas, s.inicial, s.tipo_venta, s.cuotas, s.id FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id]);

        const { tipo_venta, inicial, n_cuentas, cuotas } = req.body;
        const inicialNumber = parseFloat(inicial);
        const nCuentasNumber = parseFloat(n_cuentas);

        let result = null;

        // Obtener el id_terreno_asociado
        const [venta] = await pool.query('SELECT id_land FROM sale WHERE id = ?', [id]);
        const id_terreno_asociado = venta[0].id_land;
     
        // Obtener el estado actual del terreno
        const [terreno] = await pool.query('SELECT estado, precio FROM land WHERE id = ?', [id_terreno_asociado]);
        const estado_terreno = terreno[0].estado;
        const precio_terreno = terreno[0].precio;

        if (tipo_venta === 'contado' && estado_terreno !== 'pagado') {
            // Actualizar los datos normales y establecer los valores de "inicial", "n_cuentas" y "cuotas" como null
            result = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = NULL, n_cuentas = NULL, cuotas = NULL WHERE id = ?',
                [tipo_venta, id]
            );

            // Marcar el terreno como "pagado"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_terreno_asociado]);
        } else if (tipo_venta === 'credito') {
             // if(inicialNumber <= 0 || !cantidades.test(inicial) || nCuentasNumber <= 0 || !cantidades.test(n_cuentas) || inicialNumber >= precio_terreno) {
            if((inicialNumber >= precio_terreno)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El enganche debe ser menor que el precio del terreno.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }
            if(inicialNumber <= 0 || !cantidades.test(inicial)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de inicial son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }
            if(nCuentasNumber <= 0 || !cantidades.test(n_cuentas)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de n_cuentas son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }

            // Si es "crédito", actualiza los valores normales
            result = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = ?, n_cuentas = ?, cuotas = ? WHERE id = ?',
                [tipo_venta, inicial, n_cuentas, cuotas, id]
            );
        
            // Marcar el terreno como "proceso"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['proceso', id_terreno_asociado]);
        }
    
        
        res.render('venta', {
            alert: true,
            alertTitle: "Actualización",
            alertMessage: "¡Actualización Exitosa!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
            ruta: 'abonos'
        });
        
    } catch (error) {
        console.error("Error al actualizar la venta:", error);
        res.status(500).send('Error al actualizar la venta');
    }
};


//ELIMINAR VENTA
const eliminarVenta = async (req, res) => {
    const ventaId = req.params.id;

    const [venta] = await pool.query('SELECT id_land FROM sale WHERE id = ?', [ventaId]);

    const id_terreno_asociado = venta[0].id_land;

// Después de eliminar la venta
const [result] = await pool.query('DELETE FROM sale WHERE id=?', [ventaId]);
if (result && result.affectedRows > 0) {
    // Actualizar el estado del terreno
    const [updateResult] = await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['disponible', id_terreno_asociado]);
    if (updateResult && updateResult.affectedRows > 0) {
        // Renderizar la página con el mensaje de eliminación exitosa
        const [rows] = await pool.query('SELECT * FROM sale');
        res.render('venta', {
            alert: true,
            alertTitle: "Eliminado",
            alertMessage: "¡Eliminado Exitoso!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
            ruta: 'abonos'
        });
    } else {
        // Manejar el caso en que no se pudo actualizar el estado del terreno
        res.status(500).send('Error al actualizar el estado del terreno');
    }
} else {
    // Manejar el caso en que no se pudo eliminar la venta
    res.status(500).send('Error al eliminar la venta');
}

}


// Crear abonos
const crearAbonos = async (req, res) => {
    const id_venta = req.params.id;

    try {
        // Obtener los datos del cuerpo de la solicitud
        const { n_abono, fecha_abono, cantidad } = req.body;
         // Manejar la fecha de abono cuando no está presente
         const fechaAbono = fecha_abono || new Date();

        const [informacion]=await pool.query('SELECT  s.id AS venta_id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas AS abono_cuotas_pagadas, a.cuotas_restantes AS abono_cuotas_restantes, c.name AS customer_name, c.a_paterno AS customer_paterno, c.a_materno AS customer_materno, l.lote AS land_lote, l.manzana AS land_manzana, l.predial AS land_predial, l.id_interno AS land_id_interno, l.precio AS land_precio FROM  sale s JOIN  abonos a ON s.id = a.id_sale JOIN  customers c ON s.id_customer = c.id JOIN  land l ON s.id_land = l.id WHERE  s.id = ? ORDER BY  a.fecha_abono DESC LIMIT 1;',  [id_venta]);
        // Consulta para obtener detalles de la venta y el último abono

        const [abonosrows] = await pool.query('SELECT s.id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.id_land, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno  FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id   WHERE s.id = ? ORDER BY a.cuotas_restantes ASC LIMIT 1;', [id_venta]);
    
        

        // Verificar si algún campo está vacío
        if (!n_abono || !fecha_abono) {
            // Renderizar la vista con un mensaje de error si faltan campos
            return res.render('abonos_formulario', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos obligatorios!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/',
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                abonos: abonosrows,
            });
        } else if (abonosrows[0].cuotas_pagadas <= abonosrows[0].n_cuentas) {
            const cuotasFaltantes = abonosrows[0].cuotas_restantes;
            
            // Verificar si n_abono es un número positivo
            if (!numeros.test(n_abono)) {
                return res.render('abonos_formulario', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El número de abono debe ser un número positivo sin caracteres especiales",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/',
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    abonos: abonosrows,
                });
            }
            console.log(n_abono, "abono dado");
            console.log(cuotasFaltantes, "cuotas generales");

          

            const id_land=abonosrows[0].id_land;


            const cuota_restante = abonosrows[0].ncuotas_pagadas + parseFloat(n_abono); // Sumar n_abono a las cuotas pagadas

            // const cuota_restante = abonosrows[0].cuotas - abonosrows[0].ncuotas_pagadas; // Calcula cuotas restantes
           
            console.log(cuota_restante, "cuota pagada?");
            
            const cuota_pagada = abonosrows[0].cuotas_restantes - parseFloat(n_abono); // Restar n_abono a las cuotas restantes

            console.log(abonosrows[0].cuotas_restantes);
            console.log(cuota_pagada, "cuota restante");
            

            const deuda_restante = abonosrows[0].deuda_restante - cantidad;
            console.log(deuda_restante, "deuda restante ");
            console.log("-------------------------------------------------")

            ///aqui se valida los decimales 
            if(deuda_restante<=1){
                const deuda_restante=0;
                const id_sale = abonosrows[0].id;
                console.log(id_sale);
                 const [landsearch] = await pool.query('SELECT * FROM sale WHERE id = ?', [id_sale]);

                const id_land = landsearch[0].id_land;
            
                // Insertar el nuevo abono en la base de datos
                const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');

                const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
                [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada, cantidad, n_abono])

                   // Marcar el terreno como "proceso"
                 // await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_land])

                .catch(error => {
                    console.error('Error al insertar el abono en la base de datos:', error);
                    throw error;
                });
    
                // // Obtener el ID del último abono insertado
                // const lastInsertedAbonoId = iabono.insertId;
    
                // Actualizar la venta con las nuevas cuotas pagadas y la deuda restante
                const result = await pool.query('UPDATE sale INNER JOIN land ON sale.id_land = land.id SET sale.ncuotas_pagadas = ?, sale.deuda_restante = ?, land.estado = ? WHERE sale.id = ? AND land.id = ?', [cuota_restante, deuda_restante, 'pagado', id_sale, id_land])
                    .catch(error => {
                        console.error('Error al actualizar las cuotas en la base de datos:', error);
                        throw error; 
                    });
             
              
    
               // Genera y envía el PDF
     await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);


            }else{
                const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');

            
            // const cuota_pagada = abonosrows[0].cuotas_restantes - parseFloat(n_abono);
            // console.log(cuota_pagada, "cuota pagado");
            // ID de la venta
            const id_sale = abonosrows[0].id;
            
            // Insertar el nuevo abono en la base de datos
            const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes,cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
                [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada,cantidad, n_abono])
                .catch(error => {
                    console.error('Error al insertar el abono en la base de datos:', error);
                    throw error;
                });

      
            // Actualizar la venta con las nuevas cuotas pagadas y la deuda restante
            const result = await pool.query('UPDATE sale SET ncuotas_pagadas = ?, deuda_restante = ? WHERE id = ?', [cuota_restante, deuda_restante, id_sale])
                .catch(error => {
                    console.error('Error al actualizar las cuotas en la base de datos:', error);
                    throw error; 
                });

            

            await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);
            // res.json({ success: true });


        
      }
     }
    } catch (error) {
        console.error(error);
        // res.status(500).send('Error interno del servidor');
    }
}

async function generateAndSendPDF(informacion,cantidad,fechaAbonoFormateada, res) {

        try {
    
            const doc = new PDFDocument();
            const buffers = [];
             const fechaAbono = moment(fechaAbonoFormateada, 'YYYY-MM-DD').toDate();
             const fechaEnLetras = formatFechaEnLetras(fechaAbono);
    
                 
          // Establecer la posición de la imagen
          const imgWidth = 100; // Ancho de la imagen
          const imgHeight = 80; // Alto de la imagen
          const imgX = doc.page.width - imgWidth - 30; // Posición X de la imagen (10 píxeles desde el borde derecho)
          const imgY = 10; // Posición Y de la imagen (10 píxeles desde el borde superior)
          doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
    
            // Agregar espacio
            doc.moveDown();
    
            const fecha = `Acapulco, Guerrero, a  ${fechaEnLetras}`;
            doc.text(fecha, {
                align: 'right' // Alinea el texto a la derecha
            });
    
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
    
            // Agregar el párrafo de lorem
            const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';
            doc.text(`Israel Nogueda Pineda, ${lorem}`, {
                // width: 410,
                align: 'justify'
            });
            doc.moveDown();
            doc.moveDown();
            // Agregar el párrafo del cliente
           
            const customerName = `Recibo de la C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} la cantidad de $ ${cantidad}  como pago parcial por el lote ${informacion[0].land_lote} de la manzana ${informacion[0].land_manzana}, operación pactada en $ ${informacion[0].land_precio}, los gasos de escrituración e  impuesto predial con número ${informacion[0].land_predial}, son por cuenta del comprador, según acuerdo entre las partes, ubicado en el Fraccionamiento Fuerza Aérea Mexicana, Municipio de Acapulco, Estado de Guerrero e identificado internamiento con la clave ${informacion[0].land_id_interno}, a fin de llevar a cabo la compra venta de dicho lote.  `;
            doc.text(customerName, {
                // width: 410,
                align: 'justify'// Alinea el texto
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            const extra = `Basilisk Inmobiliaria Siete, S. de R.L de C.V `;
            doc.text(extra, {
                align: 'justify'// Alinea el texto
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            const firma  = `Israel Nogueda Pineda  `;
            doc.text(firma, {
                align: 'justify'
            });
            const apoderado  = `Apoderado.  `;
            doc.text(apoderado, {
                align: 'justify'
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
         
            const nombrelogo  = `B A S I L I S K  `;
            doc.text(nombrelogo, {
                align: 'center'
            });// Ajusta la posición vertical del pie de página
          const footerY = doc.page.height - 20;
    
          // Dibuja la línea horizontal
              const lineY = footerY - 30; // Ajusta la posición vertical de la línea
              doc.lineCap('butt')
                  .moveTo(50, lineY)
                  .lineTo(doc.page.width - 50, lineY)
                  .stroke();
      
    
            // Manejador para agregar datos al buffer
            doc.on('data', buffers.push.bind(buffers));
    
            // Manejador para finalizar el documento
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                // Envía el PDF como respuesta
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=reporte.pdf',
                    'Content-Length': pdfData.length
                });
                // alert("hola");
                res.end(pdfData);
              

            });

            // Finaliza y cierra el documento PDF
            doc.end();
            // res.json({ success: true, message: 'PDF generado exitosamente.' });
    

        } catch (error) {
            console.error('Error en la generación del PDF:', error);
            // res.status(500).send('Error interno del servidor al generar el PDF');
        }
    
    }
 


const crearPdf = async (req, res) => {
    const id_venta = req.params.id;

    try {
        // Realiza la consulta SQL para obtener la información de la venta y los abonos
        const [rows] = await pool.query('SELECT s.*, c.name AS customer_name, c.a_materno, c.a_paterno, l.lote, l.manzana, l.precio, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, a.n_abono, a.cantidad FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id_venta]);
        
        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
        
    // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los abonos que se han proporcionado desde la fecha de compra - venta del terreno. (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
    
        // Agrega información de la venta
        const nCuotasVenta = rows[0].n_cuentas;
        const cliente = rows[0].customer_name;
        const apellidopa = rows[0].a_paterno;
        const apellidoma = rows[0].a_materno;
        const terreno = rows[0].lote;
        const manzana = rows[0].manzana;
        const precio = rows[0].precio;
        const deuda = rows[0].deuda_restante;
        const precioFormateado = precio.toLocaleString();
        const inicial = rows[0].inicial;
        const inicialFormateado=inicial.toLocaleString();

        // Concatena las variables en una sola cadena
const infoVenta = `Número de Cuotas Total: ${nCuotasVenta} | Nombre cliente: ${cliente} ${apellidopa} ${apellidoma} | Venta del terreno: ${terreno}, Manzana: ${manzana} | Precio terreno: ${precioFormateado} | Enganche: ${inicialFormateado} | Deuda actual: ${deuda}`;

// Agrega el texto al documento
doc.text(infoVenta, { align: 'left' });

        const table = {
            title: "Abonos",
            subtitle: "Historial",
            headers: [
                { label: "Fecha", property: 'fecha_abono', width: 120 },
                { label: "N.Cuotas", property: 'n_abono', width: 120 }, 
                { label: "C.Restantes", property: 'cuotas_restantes', width: 120 }, 
                { label: "Abono", property: 'cantidad', width: 120 }
            ],
            rows: []
        };
        
        // Agrega datos de abonos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const abono = rows[i];
            const fechaAbono = new Date(abono.fecha_abono);
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaAbono.toLocaleDateString('es-ES', options); // 'es-ES' es el código de idioma para español
        
            // Agregar cada fila de abono a la tabla
            table.rows.push([
                fechaFormateada,
                abono.n_abono,
                abono.cuotas_restantes,
                abono.cantidad

            ]);
        }
      

        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11), 
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(11); 
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
      // Ajusta la posición vertical del pie de página
      const footerY = doc.page.height - 20;

    // Dibuja la línea horizontal
        const lineY = footerY - 30; // Ajusta la posición vertical de la línea
        doc.lineCap('butt')
            .moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

      

        // Manejador para agregar datos al buffer
        doc.on('data', buffers.push.bind(buffers));

        // Manejador para finalizar el documento
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Envía el PDF como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=Venta.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        res.status(500).send('Error interno del servidor al generar el PDF');
    }
}

const contado = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT s.*, c.name AS customer_name, c.a_materno, c.a_paterno, s.fecha_venta, l.precio, l.lote, l.manzana FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.tipo_venta = "contado";');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
        

        // Agrega datos de ventas de terrenos a la tabla
for (let i = 0; i < rows.length; i++) {
    const venta = rows[i];
    console.log('Lote:', venta.lote, 'Manzana:', venta.manzana); // Agrega este console.log para verificar los valores de lote y manzana
    // Resto del código para construir las filas de la tabla...
}

        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que se han vendido a contado (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos Vendidos contado",
            subtitle: "Historial de compras a contado",
            headers: [
                { label: "Fecha", property: 'fecha_venta', width: 70 },
                { label: "Cliente", property: 'customer_name', width: 200 }, 
                { label: "Precio", property: 'precio', width: 100 },
                { label: "L", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 50 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de ventas de terrenos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const venta = rows[i];
        
            // Crear una instancia de fecha a partir de venta.fecha_venta
            const fechaVenta = new Date(venta.fecha_venta);
        
            // Formatear la fecha como dd/mm/yyyy
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaVenta.toLocaleDateString('es-ES', options); // 'es-ES' es el código de idioma para español
        
            // Agregar cada fila de venta de terreno a la tabla
            table.rows.push([
                fechaFormateada,
                `${venta.customer_name} ${venta.a_paterno} ${venta.a_materno}`,
                venta.precio,
                venta.lote, // Agregar el valor del lote
                venta.manzana // Agregar el valor de la manzana
            ]);
        }

        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(12); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
        const footerY = doc.page.height - 20;

        // Dibuja la línea horizontal
        const lineY = footerY - 30; // Ajusta la posición vertical de la línea
        doc.lineCap('butt')
            .moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

        // Manejador para agregar datos al buffer
        doc.on('data', buffers.push.bind(buffers));

        // Manejador para finalizar el documento
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Envía el PDF como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=contado.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        res.status(500).send('Error interno del servidor al generar el PDF');
    }
}

const proceso = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT s.*, c.name AS customer_name, c.a_materno, c.a_paterno, s.fecha_venta, s.ncuotas_pagadas, l.precio, l.lote, l.manzana FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.tipo_venta = "credito";');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
        

        // Agrega datos de ventas de terrenos a la tabla
for (let i = 0; i < rows.length; i++) {
    const venta = rows[i];
    console.log('Lote:', venta.lote, 'Manzana:', venta.manzana); // Agrega este console.log para verificar los valores de lote y manzana
    // Resto del código para construir las filas de la tabla...
}

        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que se han vendido a contado (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos Vendidos contado",
            subtitle: "Historial de compras a contado",
            headers: [
                { label: "Fecha", property: 'fecha_venta', width: 70 },
                { label: "Cliente", property: 'customer_name', width: 200 }, 
                { label: "Precio", property: 'precio', width: 100 },
                { label: "L", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 50 } ,
                { label: "C.P", property: 'ncuotas_pagadas', width: 50 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de ventas de terrenos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const venta = rows[i];
        
            // Crear una instancia de fecha a partir de venta.fecha_venta
            const fechaVenta = new Date(venta.fecha_venta);
        
            // Formatear la fecha como dd/mm/yyyy
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaVenta.toLocaleDateString('es-ES', options); // 'es-ES' es el código de idioma para español
        
            // Agregar cada fila de venta de terreno a la tabla
            table.rows.push([
                fechaFormateada,
                `${venta.customer_name} ${venta.a_paterno} ${venta.a_materno}`,
                venta.precio,
                venta.lote, // Agregar el valor del lote
                venta.manzana,
                venta.ncuotas_pagadas // Agregar el valor de la manzana
            ]);
        }

        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(12); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
        const footerY = doc.page.height - 20;

        // Dibuja la línea horizontal
        const lineY = footerY - 30; // Ajusta la posición vertical de la línea
        doc.lineCap('butt')
            .moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

        // Manejador para agregar datos al buffer
        doc.on('data', buffers.push.bind(buffers));

        // Manejador para finalizar el documento
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Envía el PDF como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=proceso.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        res.status(500).send('Error interno del servidor al generar el PDF');
    }
}

const disponibles = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT * FROM LAND WHERE estado = "disponible"');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
  
        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que estan disponibles (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos disponibles",
            subtitle: "Historial de terrenos disponibles",
            headers: [
                { label: "id_Interno", property: 'id_interno', width: 100 },
                { label: "calle", property: 'calle', width: 100 }, 
                { label: "l", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 70 } ,
                { label: "S", property: 'superficie', width: 50 } ,
                { label: "P", property: 'predial', width:100 } ,
                { label: "E", property: 'escritura', width: 20 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de terrenos disponibles a la tabla
        for (let i = 0; i < rows.length; i++) {
            const terreno = rows[i];
            
            // Agregar cada fila de terreno disponible a la tabla
            table.rows.push([
                terreno.id_interno,
                terreno.calle,
                terreno.lote,
                terreno.manzana,
                terreno.superficie,
                terreno.predial,
                terreno.escritura
            ]);
        }


        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(12); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
        const footerY = doc.page.height - 20;

        // Dibuja la línea horizontal
        const lineY = footerY - 30; // Ajusta la posición vertical de la línea
        doc.lineCap('butt')
            .moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

        // Manejador para agregar datos al buffer
        doc.on('data', buffers.push.bind(buffers));

        // Manejador para finalizar el documento
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Envía el PDF como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=disponibles.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        res.status(500).send('Error interno del servidor al generar el PDF');
    }
}


const pagados = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT * FROM LAND WHERE estado = "pagado"');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
  
        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que estan pagados (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos Pagados",
            subtitle: "Historial de terrenos pagados",
            headers: [
                { label: "id_Interno", property: 'id_interno', width: 100 },
                { label: "calle", property: 'calle', width: 100 }, 
                { label: "L", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 70 } ,
                { label: "S", property: 'superficie', width: 50 } ,
                { label: "P", property: 'predial', width:100 } ,
                { label: "E", property: 'escritura', width: 20 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de terrenos disponibles a la tabla
        for (let i = 0; i < rows.length; i++) {
            const terreno = rows[i];
            
            // Agregar cada fila de terreno disponible a la tabla
            table.rows.push([
                terreno.id_interno,
                terreno.calle,
                terreno.lote,
                terreno.manzana,
                terreno.superficie,
                terreno.predial,
                terreno.escritura
            ]);
        }


        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(11); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
        const footerY = doc.page.height - 20;

        // Dibuja la línea horizontal
        const lineY = footerY - 30; // Ajusta la posición vertical de la línea
        doc.lineCap('butt')
            .moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

        // Manejador para agregar datos al buffer
        doc.on('data', buffers.push.bind(buffers));

        // Manejador para finalizar el documento
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Envía el PDF como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=pagados.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        res.status(500).send('Error interno del servidor al generar el PDF');
    }
}

const finiquito =async (req,res)=>{
    const id_venta = req.params.id;

    const [informacion]=await pool.query('SELECT  s.id AS venta_id, MAX(a.fecha_abono) AS ultima_fecha_abono,  c.name AS customer_name, c.a_paterno AS customer_paterno, c.a_materno AS customer_materno, l.lote AS land_lote, l.manzana AS land_manzana, l.predial AS land_predial, l.id_interno AS land_id_interno FROM  sale s JOIN  abonos a ON s.id = a.id_sale JOIN  customers c ON s.id_customer = c.id JOIN  land l ON s.id_land = l.id WHERE  s.id = ? ORDER BY  a.fecha_abono DESC LIMIT 1;',  [id_venta]);
   
    try{

   console.log(informacion)

    // Inicializa el documento PDF
    const doc = new PDFDocument();
    const buffers = [];
 
      // Establecer la posición de la imagen
      const imgWidth = 100; // Ancho de la imagen
      const imgHeight = 80; // Alto de la imagen
      const imgX = doc.page.width - imgWidth - 30; // Posición X de la imagen (10 píxeles desde el borde derecho)
      const imgY = 10; // Posición Y de la imagen (10 píxeles desde el borde superior)
      doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });

      // Obtenemos la fecha en formato de objeto Date
    const fechaAbono = new Date(informacion[0].ultima_fecha_abono);

    // Formateamos la fecha en letras
    const fechaFormateada = formatFechaEnLetras(fechaAbono);
    
    const tipo = `CARTA FINIQUITO`;
      doc.text(tipo, {
          align: 'left' // Alinea el texto a la derecha
      });
      doc.moveDown();
   
      const fecha = `Acapulco, Guerrero, a   ${fechaFormateada}`;
      doc.text(fecha, {
          align: 'right' // Alinea el texto a la derecha
      });
      doc.moveDown();
      doc.moveDown();
    
        // Agregar el párrafo de lorem
        const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';
        doc.text(`Israel Nogueda Pineda, ${lorem}`, {
            // width: 410,
            align: 'justify'
        });

        doc.moveDown();
        doc.moveDown();
        // Agregar el párrafo del cliente
        const finiquito = `Por este conducto manifiesto, a nombre de mi representada, que  C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} ha cumplido a plena satisfacción de mi representada con los pagos convenidos en el contrato privado de compra venta establecido entre las partes respecto al inmueble con clave  ${informacion[0].land_id_interno}, manzana  ${informacion[0].land_manzana} lote  ${informacion[0].land_lote}, ubicado en el Fraccionamiento Fuerza Área Mexicana, municipio de Acapulco de Juáres, Estado de Guerrero.   `;

        doc.text(finiquito, {
            // width: 410,
            align: 'justify'// Alinea el texto
        });
        doc.moveDown();
    
               // Agregar el párrafo del cliente
        const texto = `De conformidad con la claúsula QUINTA Y SEXTA del Contrato, en cuestión, Basilisk Inmobiliaira Siete S de RL de CV, ratifica, la obligatoriedad de firmar la escritura pública ante la fe del Notario Público que haya sido elegido por C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno}, obligándose a entregar la documentación necesaria para la celebración de la misma, quedando a cargo de C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} los honorarios, gastos, impuestos y derechos que genere la escritura pública, así como también todos los gastos e impuestos anteriores y posteriores por concepto de predial con cuenta catastral   ${informacion[0].land_predial} y derechos por servicios de agua, luz o cualquier otro servicio que se tenga que cubrir por lote materia de compraventa, para llevar a cabo la escrituración respectiva.   `;

        doc.text(texto, {
         align: 'justify'// Alinea el texto
               });
               doc.moveDown();
               doc.moveDown();
            doc.moveDown();
        
            doc.moveDown();
            const extra = `Basilisk Inmobiliaria Siete, S. de R.L de C.V `;
            doc.text(extra, {
                align: 'justify'// Alinea el texto
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
         
            doc.moveDown();
            doc.moveDown();
            const firma  = `Israel Nogueda Pineda  `;
            doc.text(firma, {
                align: 'justify'
            });
            const apoderado  = `Apoderado.  `;
            doc.text(apoderado, {
                align: 'justify'
            });
            doc.moveDown();
            doc.moveDown();
        
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
         
            const nombrelogo  = `B A S I L I S K  `;
            doc.text(nombrelogo, {
                align: 'center'
            });// Ajusta la posición vertical del pie de página
          const footerY = doc.page.height - 20;
    
          // Dibuja la línea horizontal
              const lineY = footerY - 30; // Ajusta la posición vertical de la línea
              doc.lineCap('butt')
                  .moveTo(50, lineY)
                  .lineTo(doc.page.width - 50, lineY)
                  .stroke();
    
        
   
        // Manejador para agregar datos al buffer
        doc.on('data', buffers.push.bind(buffers));

        // Manejador para finalizar el documento
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Envía el PDF como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=finalizacion.pdf',
                'Content-Length': pdfData.length
            });
            // alert("hola");
            res.end(pdfData);
        
        });

        // Finaliza y cierra el documento PDF
        doc.end();
        // res.json({ success: true, message: 'PDF generado exitosamente.' });
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // res.status(500).send('Error interno del servidor al generar el PDF');
    }

}



export const methods = {
    register,
    login,
    auth,
    usuarios,
    editarUsuario,
    eliminarUsuario,
    crearCliente,
    editarClientes,
    eliminarCliente,
    crearTerreno,
    editarTerrenos,
    eliminarTerreno,
    crearVenta,
    editarVenta,
    eliminarVenta,
    crearAbonos,
    crearPdf,
    contado,
    proceso,
    disponibles,
    pagados,    
    perfil,
    finiquito,
  }



  // Función para obtener el día en letras
function getDiaEnLetras(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dia = fecha.getDay();
    return dias[dia];
}

// Función para obtener el mes en letras
function getMesEnLetras(fecha) {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mes = fecha.getMonth();
    return meses[mes];
}

// Función para formatear la fecha
function formatFechaEnLetras(fecha) {
    const dia = getDiaEnLetras(fecha);
    const mes = getMesEnLetras(fecha);
    const año = fecha.getFullYear();
    return `${dia} ${fecha.getDate()} de ${mes} de ${año}`;
}