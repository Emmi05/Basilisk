import { Router } from 'express';
import { pool} from '../database/db.js'
import { methods as controlador} from '../controller/controlador.js'
import { methods as clientes} from '../controller/clientes.js'
import { methods as terrenos} from '../controller/terrenos.js'
import {methods as ventas} from '../controller/ventas.js'
import { methods as abonos} from '../controller/abonos.js'
import {methods as pdf} from '../controller/pdf.js'

import { autenticacionMiddleware } from '../middlewares/auth.js'; //
import { autorizacionMiddleware } from '../middlewares/autorización.js'; // 

const router = Router();// Definición de la ruta '/'

router.get('/nosotros', (req, res) => {
    res.render('nosotros');
});

router.get('/contactanos', (req, res) => {
    res.render('contactanos');
});

router.get('/services', (req, res) => {
    res.render('terrenos_index');
});

router.get('/inicio_terrenos', (req, res) => {
    res.render('vista_terrenos');
});




router.get('/',  controlador.home);
  

router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', controlador.login)

// PROFILE
router.get('/profile', autenticacionMiddleware, controlador.perfil);
router.post('/profile', autenticacionMiddleware, controlador.password);
router.get('/logout', function(req, res) {
   
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/registro_usuario', autenticacionMiddleware,autorizacionMiddleware ('admin'), async  (req, res) => {
        res.render('register', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });
    })    
router.post('/register',  autenticacionMiddleware, autorizacionMiddleware ('admin'), controlador.register);

 router.get('/usuarios', autenticacionMiddleware,autorizacionMiddleware ('admin'),  async(req, res) => {

            const [rows] = await pool.query('SELECT *FROM users');
            res.render('usuarios', {
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows
            });
        }
);

router.get('/editar_usuario/:id', autenticacionMiddleware, autorizacionMiddleware ('admin'), async(req, res) => {
    const id = req.params.id;
    
        const [rows] = await pool.query('SELECT * FROM users WHERE id=?',[id]);
        res.render('editar', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
});

router.post('/update/:id',autenticacionMiddleware, autorizacionMiddleware ('admin'), controlador.editarUsuario);

router.get('/delete/:id',autenticacionMiddleware, autorizacionMiddleware ('admin'), controlador.eliminarUsuario);



router.get('/cliente',autenticacionMiddleware,  async(req, res) => {
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

router.post('/cliente',autenticacionMiddleware,  clientes.crearCliente)


//ver clientesss
router.get('/clientes',autenticacionMiddleware,  async(req, res) => {
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT c.*, p.name_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id');

        res.render('clientes', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
           
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT c.*, p.name_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id');

        res.render('clientes', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
       
        });
    }
});



// editar cambiar ruta se pone la misma / en el boton y cambiar rows debo darle permiso a mi usuario y cambiar el rol a false en usuario
router.get('/editar_cliente/:id', autenticacionMiddleware, async(req, res) => {

    const id = req.params.id;
    if (req.session.rol == 'usuario') {
        const [rows] =await pool.query('SELECT c.*, p.name_conyuge, p.a_paterno_conyuge, p.a_materno_conyuge, p.cel_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id WHERE c.id = ?', [id]);

        res.render('clienteEdit', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
        });
    }
    else if (req.session.rol == 'admin') {
        const [rows] =await pool.query('SELECT c.*, p.name_conyuge, p.a_paterno_conyuge, p.a_materno_conyuge, p.cel_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id WHERE c.id = ?', [id]);
        res.render('clienteEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
        });
    }
});
router.post('/updatecliente/:id',autenticacionMiddleware, clientes.editarClientes);

router.get('/deletecliente/:id',autenticacionMiddleware, clientes.eliminarCliente);




// terreno
router.get('/terreno', autenticacionMiddleware, async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('terrenoAlta', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        
        res.render('terrenoAlta', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });
    }
});

router.post('/terreno',autenticacionMiddleware,  terrenos.crearTerreno);

//VER CLIENTES
router.get('/terrenos', autenticacionMiddleware, async(req, res) => {
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT *FROM land');
        res.render('terrenos', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT *FROM land');
        res.render('terrenos', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows
        });
    }
});

router.get('/editar_terreno/:id',autenticacionMiddleware, async(req, res) => {

    const id = req.params.id;
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT * FROM land WHERE id=?',[id]);
        res.render('terrenosEdit', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows,
        });
    }
    else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT * FROM land WHERE id=?',[id]);
        res.render('terrenosEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows,
        });
    }
});

 router.post('/updateterreno/:id',autenticacionMiddleware, terrenos.editarTerrenos);


//  ELIMINAR TERRENO
router.get('/deleteterreno/:id', autenticacionMiddleware, terrenos.eliminarTerreno);


// venta
router.get('/ventas',autenticacionMiddleware, ventas.ventas);
router.get('/terreno/:id', autenticacionMiddleware, async (req, res) => {
    const terrenoId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM land WHERE id = ?', [terrenoId]);

    if (rows.length > 0) {
        res.json(rows[0]); // Enviar datos del terreno al cliente
    } else {
        res.status(404).json({ error: 'Terreno no encontrado' });
    }
});
router.post('/venta',autenticacionMiddleware, ventas.crearVenta);
router.get('/view_venta',autenticacionMiddleware, ventas.view_venta);
router.get('/venta/:id',autenticacionMiddleware, ventas.view_editar);
router.post('/updateventa/:id', autenticacionMiddleware, ventas.editarVenta);


//  ELIMINAR TERRENO
router.get('/deleteventa/:id',autenticacionMiddleware,  ventas.eliminarVenta);


// tambien va usuario?? 
router.get('/credits', autenticacionMiddleware, async(req, res) => {
 if (req.session.rol == 'admin') {
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


router.get('/abono', autenticacionMiddleware, abonos.abonos_vista);
router.get('/abonos/:id', autenticacionMiddleware, abonos.abonos_formulario);
router.post('/crear_abonos/:id',autenticacionMiddleware, abonos.crearAbonos);
router.post('/crear_abonos/:id',autenticacionMiddleware, abonos.crearAbonos);


router.get('/terrenos_pagados', autenticacionMiddleware, async(req, res) => {
    
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT s.id AS sale_id, s.*, c.*, l.* FROM sale s JOIN land l ON s.id_land = l.id JOIN customers c ON s.id_customer = c.id WHERE l.estado = "pagado"');
    
        res.render('terrenos_pagados', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            pagados: rows,
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT s.id AS sale_id, s.*, c.*, l.* FROM sale s JOIN land l ON s.id_land = l.id JOIN customers c ON s.id_customer = c.id WHERE l.estado = "pagado"');
        res.render('terrenos_pagados', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            pagados: rows,
        });
    }
});

// crear abono

router.get('/reporte/:id',autenticacionMiddleware, pdf.crearPdf);
router.get('/pagados/',autenticacionMiddleware, pdf.pagados);
router.get('/proceso/',autenticacionMiddleware,pdf.proceso);
router.get('/disponibles/',autenticacionMiddleware,pdf.disponibles);
router.get('/finalizacion/:id',autenticacionMiddleware,pdf.finiquito);





export default router;