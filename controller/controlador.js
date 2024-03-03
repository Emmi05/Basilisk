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
export const editarUsuario=async(req,res)=>{
    const {id}=req.params
    const { user, name, rol, pass } = req.body;
    try {
     //    console.log(id, nombre, usuario, password)
     const [result] = await pool.query('UPDATE users SET user = IFNULL (?, user), name = IFNULL (?, name), rol = IFNULL (?, rol), pass = IFNULL (?, pass) WHERE id = ?', [user, name, rol, pass,id])
     console.log(result)   
     if (result.affectedRows === 0) return res.status(404).json({
         message: 'Usuario a actualizar no encontrado'
     })
     const [rows] = await pool.query('SELECT *FROM usuarios WHERE id = ?', [id])
     res.json(rows[0])
    } catch (error) {
     return res.status(500).json({
     message: 'something went wrong'
     })
    }
 }
 


export const methods = {
    usuarios,
    editarUsuario,
  }
