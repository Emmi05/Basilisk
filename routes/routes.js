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

router.get('/delete/:id', async(req, res) => {
    const id = req.params.id;
     if (req.session.rol == 'admin') {
        const [result]=await pool.query('DELETE FROM users WHERE id=?',[req.params.id])
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM users');
        res.render('usuarios', {
            alert: true,
            alertTitle: "Eliminar",
            alertMessage: "¡Actualización Exitoso",
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
    }
     }
    });
    
export default router;