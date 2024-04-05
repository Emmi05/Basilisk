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

// 3 - Invocamos a dotenv
dotenv.config({ path: './env/.env' });

app.use('/resources', expressStatic('public'));
app.set('view engine', 'ejs');


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


//para poder trabajar con las cookies
app.use(cookieParser())

// 9 - establecemos las rutas
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


app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});
