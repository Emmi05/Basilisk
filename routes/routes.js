import { Router } from 'express';
import { pool} from '../database/db.js'
import {methods as authentication} from '../controller/controlador.js'
const router = Router();


// router.get('/usuarios',authentication.usuarios);

//ver usuarios
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

router.post('/cliente', authentication.crearCliente)


//ver clientesss
router.get('/clientes', async(req, res) => {
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
router.get('/clienteEdit/:id', async(req, res) => {

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
router.post('/updatecliente/:id',authentication.editarClientes);

router.get('/deletecliente/:id', authentication.eliminarCliente);




// terreno
router.get('/terreno', async(req, res) => {
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

router.post('/terreno', authentication.crearTerreno);

//VER CLIENTES
router.get('/terrenos', async(req, res) => {
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

router.get('/terrenoedit/:id', async(req, res) => {

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

 router.post('/updateterreno/:id',authentication.editarTerrenos);


//  ELIMINAR TERRENO
router.get('/deleteterreno/:id', authentication.eliminarTerreno);


// venta
router.get('/ventas', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM customers');
    const [rows2] = await pool.query('SELECT * FROM land');
    // const [rows2] = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?');

    if (req.session.rol == 'usuario') {
        res.render('ventas', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows, //clientes
            terrenos: rows2, // terrenos
        });
    } else if (req.session.rol == 'admin') {
        res.render('ventas', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows, // Cambié 'ventas' por 'clientes'
            terrenos:rows2,
        });
    }
});


router.get('/terreno/:id', async (req, res) => {
    const terrenoId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM land WHERE id = ?', [terrenoId]);

    if (rows.length > 0) {
        res.json(rows[0]); // Enviar datos del terreno al cliente
    } else {
        res.status(404).json({ error: 'Terreno no encontrado' });
    }
});

router.post('/venta', authentication.crearVenta)

//VER VENTAS

router.get('/abonos', async(req, res) => {
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT c.name as customer_name, l.lote, l.manzana  FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id;');
        res.render('venta', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, s.fecha_venta, s.n_cuentas, s.id, s.tipo_venta FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id;');
        res.render('venta', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows
        });
    }
});

//Editar
router.get('/venta/:id', async(req, res) => {

    const id = req.params.id;
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, l.id_interno, s.fecha_venta, s.n_cuentas, s.inicial, s.tipo_venta, s.cuotas, s.id FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id]);

        res.render('ventaEdit', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
        });
    }
    else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, l.id_interno, s.fecha_venta, s.n_cuentas, s.inicial, s.tipo_venta, s.cuotas, s.id FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id]);
        res.render('ventaEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
        });
    }
});



router.post('/updateventa/:id',authentication.editarVenta);


//  ELIMINAR TERRENO
router.get('/deleteventa/:id', authentication.eliminarVenta);



router.get('/credits', async(req, res) => {
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


export default router;