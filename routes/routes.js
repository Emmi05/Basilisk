import { Router } from 'express';
import { pool} from '../database/db.js'

const router = Router();

router.get('/register', (req, res) => {
    res.render('register');
});

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
        
        // res.render('usuarios');
});

export default router;