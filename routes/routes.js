import {methods as authentication} from './controller.js';
import { Router } from 'express'
const router = Router();

//9 - establecemos las rutas
// const router=require('express');
router.get('/login',authentication.login );

// router.get('/login',(req, res)=>{
//     res.render('login');
// })


router.get('/register',authentication.auth);

app.get('/register',(req, res)=>{
    res.render('register');
})