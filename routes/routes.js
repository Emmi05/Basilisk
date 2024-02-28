//9 - establecemos las rutas
const router=require('express');

router.get('/login',(req, res)=>{
    res.render('login');
})

app.get('/register',(req, res)=>{
    res.render('register');
})