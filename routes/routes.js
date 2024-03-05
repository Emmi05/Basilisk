import { Router } from 'express';
import { pool} from '../database/db.js'
import {methods as authentication} from '../controller/controlador.js'
const router = Router();


// router.get('/usuarios',authentication.usuarios);


 router.get('/usuarios', async(req, res) => {
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
});

router.get('/editar/:id', async(req, res) => {
    const id = req.params.id;
     if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT * FROM users WHERE id=?',[id]);
        res.render('editar', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
    }
});
router.post('/update/:id',authentication.editarUsuario);


// router.delete('/eliminar/:id',authentication.eliminarUsuario );

router.get('/delete/:id', authentication.eliminarUsuario);

// ruta clientes

router.get('/cliente', async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('registro', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        
        res.render('registro', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
    
        });
    }
});

router.get('/clientes', async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('clientes', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT *FROM customer');
        res.render('clientes', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows
        });
    }
});
router.post('/cliente', authentication.crearCliente)


// editar cambiar ruta se pone la misma / en el boton y cambiar rows 
router.get('/clienteEdit/:id', async(req, res) => {
    const id = req.params.id;
     if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT * FROM customer WHERE id=?',[id]);
        res.render('clienteEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
        });
    }
});
router.post('/updatecliente/:id',authentication.editarClientes);

router.get('/deletecliente/:id', authentication.eliminarCliente);

export default router;