import rutas from './routes/routes.js';
// 1 - Invocamos a Express
import express from 'express';
import {methods as authentication} from './controller/controlador.js'
const app = express();

// 2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
import { urlencoded, json } from 'express';
app.use(urlencoded({ extended: false }));
app.use(json());

// 3 - Invocamos a dotenv
import dotenv from 'dotenv';
dotenv.config({ path: './env/.env' });

// 4 - seteamos el directorio de assets
import { static as expressStatic } from 'express';
app.use('/resources', expressStatic('public'));

// 5 - Establecemos el motor de plantillas
app.set('view engine', 'ejs');

// 6 - Invocamos a bcrypt
import bcrypt from 'bcryptjs';

// 7 - variables de session
import session from 'express-session';
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// 8 - Invocamos a la conexion de la DB

import { pool} from './database/db.js'

// 9 - establecemos las rutas
app.get('/login', (req, res) => {
    res.render('login');
});
app.use(rutas);

// app.get('/register',authentication.registro);

app.get('/register', async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('register', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        
        res.render('register', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
    
        });
    }
    
    // res.render('usuarios');
});



// 10 - Método para la REGISTRACIÓN
app.post('/register', async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error);
        // Manejar el error apropiadamente
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// 11 - Metodo para la autenticacion
app.post('/auth', async (req, res) => {
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
                
                if (req.session.rol == 'usuario') {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Propiedad:",
                        alertMessage: "¡SARAHI!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: ''
                    });
                } else {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Eres larry",
                        alertMessage: "Ata Papa",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
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
});


// 12 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.rol == 'usuario') {
            res.render('home', {
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol
            });
        } else if (req.session.rol == 'admin') {
            res.render('home', {
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol
            });
        }
        res.end();
    } else {
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});

// función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// Logout
app.get('/logout', function(req, res) {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

//error 404
app.use((req, res, next) => {
    res.status(404)
    res.render('404')
});


app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});
