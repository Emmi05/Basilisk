import helmet from 'helmet';
import rutas from './routes/routes.js';
import express from 'express';
import { urlencoded, json } from 'express';
import dotenv from 'dotenv';
import { static as expressStatic } from 'express';
import session from 'express-session';
import cookieParser from'cookie-parser';

const app = express();
app.use(urlencoded({ extended: false }));
app.use(json());

//  Invocamos a dotenv
dotenv.config({ path: './env/.env' });

app.use('/resources', expressStatic('public'));
app.set('view engine', 'ejs');

// Configuración del middleware de sesión
app.use(session({
    secret: 'P0st3D3t3l3f0n0vi3jo@', // Clave secreta
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2 * 60 * 1000 // Duración de la sesión en milisegundos (2 minutos)
    }
}));

//para poder trabajar con las cookies
app.use(cookieParser())
// establecemos las rutas
app.use(rutas);

// función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.use(helmet());

//error 404
app.use((req, res, next) => {
    res.status(404)
    res.render('404')
});

app.use((err, req, res, next) => {
    console.error('Error de servidor:', err.stack);
    res.status(500).render('500');
});


app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});
