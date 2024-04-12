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


export const methods = {
    crearCliente,
    editarClientes,
    eliminarCliente,
  }
