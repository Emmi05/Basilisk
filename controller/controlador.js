import { pool} from '../database/db.js'

export const usuarios=  async(req, res) => {
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
}
// export const registro=  async(req, res) => {
//     if (req.session.rol == 'usuario') {
//         res.render('register', {
//             login: true,
//             roluser: false,
//             name: req.session.name,
//             rol: req.session.rol
//         });
//     } else if (req.session.rol == 'admin') {
//         // const [rows] = await pool.query('SELECT *FROM users');
//         res.render('register', {
//             login: true,
//             roluser: true,
//             name: req.session.name,
//             rol: req.session.rol,
//             // usuarios: rows
//         });
//     }
// }


export const methods = {
    usuarios,
  }
