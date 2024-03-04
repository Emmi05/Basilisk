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
export const editarUsuario = async (req, res) => {

        if (req.session.rol == 'admin') {
            const { id } = req.params;
            const { user, name, rol } = req.body;
            const [result] = await pool.query('UPDATE users SET name = IFNULL (?, name), user = IFNULL (?, user), rol = IFNULL (?, rol) WHERE id = ?', [name, user, rol, id]);
        //otro if de si es mayor a 0?
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM users');
        res.render('usuarios', {
            alert: true,
            alertTitle: "Actualización",
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
    } }else{
        (error) 
            console.error(error);
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
    }
 



    export const eliminarUsuario = async (req, res) => {

        if (req.session.rol == 'admin') {
            const { id } = req.params;
            const [result]=await pool.query('DELETE FROM users WHERE id=?',[id])
        //otro if de si es mayor a 0?
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM users');
        res.render('usuarios', {
            alert: true,
            alertTitle: "Eliminado",
            alertMessage: "¡Eliminado Exitoso",
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
    } }else{
        (error) 
            console.error(error);
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
    }


export const methods = {
    usuarios,
    editarUsuario,
    eliminarUsuario
  }
