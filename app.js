import helmet from 'helmet';
import rutas from './routes/routes.js';
import express from 'express';
import { urlencoded, json } from 'express';
import dotenv from 'dotenv';
import { static as expressStatic } from 'express';
import session from 'express-session';



const app = express();
app.use(urlencoded({ extended: false }));
app.use(json());

// 3 - Invocamos a dotenv
dotenv.config({ path: './env/.env' });

app.use('/resources', expressStatic('public'));

// 5 - Establecemos el motor de plantillas
app.set('view engine', 'ejs');



// 7 - variables de session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));



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


      

// 11 - Metodo para la autenticacion


// 12 - Método para controlar que está auth en todas las páginas


// función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.use(helmet());
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
