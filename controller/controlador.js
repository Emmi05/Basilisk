import { pool} from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {promisify} from 'util';



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
                        alertTitle: "Usuario normal:",
                        alertMessage: "Usuario",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        ruta: ''
                    });
                } else {
                      
                    res.render('login', {
                        alert: true,
                        alertTitle: "Usuario",
                        alertMessage: "Administrador",
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
    // Si ya estás en la página de inicio, no redirigir
    if (req.originalUrl === '/') {
        return next();
    }

    // Si el usuario ya está en la página de login, no redirigir
    if (req.originalUrl === '/login') {
        return next();
    }

    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            
            const results = await pool.query('SELECT * FROM users WHERE id = ?', [decodificada.id]);
    
            if (results.length > 0) {
                req.user = results[0];
                return next();
            } else {
                throw new Error('Usuario no encontrado');
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.log('Token expirado');
                res.clearCookie('jwt');
                return res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Token expirado",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
          
            }
            console.error(error);
            return res.render('login', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Error al verificar token",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        
        }
    } else {
        res.redirect('/login');
        return;
    }
}

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

export const password = async (req, res) => {
    const { pass, newpass } = req.body;

    const userId = req.user[0].id; // Accediendo al ID de usuario desde req.user

    if (req.session.rol === 'usuario') {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
 // Verificar si algún campo está vacío
        if (!pass || !newpass) {
            return res.render('profile', {
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
                usuarios: rows,
            });
        }
            // Obtener la contraseña actual del usuario desde la base de datos
            const storedPassword = rows[0].pass;

            // Comparar la contraseña actual con la que el usuario está proporcionando
            const passwordMatch = await bcrypt.compare(pass, storedPassword);

            if (!passwordMatch) {
                return res.render('profile', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Contraseña vieja error!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/', 
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    usuarios: rows,
                });
            } else {
                // La contraseña actual es correcta, puedes proceder con el cambio de contraseña
                const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
                if (!passwordRegex.test(newpass)) {
                    return res.render('profile', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', // Redirigir a la página de registro nuevamente
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rol,
                        usuarios: rows,
                    });
                }
         // Aquí deberías agregar la lógica para cambiar la contraseña en la base de datos
         const passwordHash = await bcrypt.hash(newpass, 8); // Hash de la nueva contraseña, no de la contraseña actual

         await pool.query('UPDATE users SET pass = ? WHERE id = ?', [passwordHash, userId]);
         
               res.render('profile', {
                alert: true,
                alertTitle: "Contraseña",
                alertMessage: "Cambio Exitoso!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
            });

              
            }

        } catch (error) {
            console.error('Error al ejecutar la consulta SQL:', error);
            return res.status(500).render('500');
        
        }
        } else if (req.session.rol === 'admin') {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
 // Verificar si algún campo está vacío
        if (!pass || !newpass) {
            return res.render('profile', {
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
                usuarios: rows,
            });
        }
            // Obtener la contraseña actual del usuario desde la base de datos
            const storedPassword = rows[0].pass;

            // Comparar la contraseña actual con la que el usuario está proporcionando
            const passwordMatch = await bcrypt.compare(pass, storedPassword);

            if (!passwordMatch) {
                return res.render('profile', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Contraseña vieja error!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    usuarios: rows,
                });
            } else {
                // La contraseña actual es correcta, puedes proceder con el cambio de contraseña
                const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
                if (!passwordRegex.test(newpass)) {
                    return res.render('profile', {
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
                        usuarios: rows,
                    });
                }
         // Aquí deberías agregar la lógica para cambiar la contraseña en la base de datos
         const passwordHash = await bcrypt.hash(newpass, 8); // Hash de la nueva contraseña, no de la contraseña actual

         await pool.query('UPDATE users SET pass = ? WHERE id = ?', [passwordHash, userId]);
         
               res.render('profile', {
                alert: true,
                alertTitle: "Contraseña",
                alertMessage: "Cambio Exitoso!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
            });

              
            }

        } catch (error) {
            console.error('Error al ejecutar la consulta SQL:', error);
            return res.status(500).render('500');

        }
    }
}


export const register=  async(req, res) => {
    try {
        if (req.session.rol == 'admin') {
        const { user, name, rol, pass } = req.body;
        
        // console.log(req.body)
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
        return res.status(500).render('500');
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
        // res.status(500).send('Error interno del servidor');
        return res.status(500).render('500');
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
            // res.status(500).send('Error interno del servidor');
            return res.status(500).render('500');
        }
    }


    // CLIENTES

export const methods = {
    register,
    login,
    auth,
    usuarios,
    editarUsuario,
    eliminarUsuario,
    
    perfil,
 
    password,
  }



