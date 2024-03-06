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
        // (error) 
        //     console.error(error);
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
    }


    // CLIENTES
    export const crearCliente= async (req, res) => {

        try {
            if (req.session.rol == 'usuario') {
            const { name, cel, conyuge_name, conyuge_cel, adress } = req.body;
            await pool.query('INSERT INTO customer SET ?', { name, cel, conyuge_name, conyuge_cel,adress });
            
            res.render('registro', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }else if (req.session.rol == 'admin'){
            const { name, cel, conyuge_name, conyuge_cel, adress } = req.body;
            await pool.query('INSERT INTO customer SET ?', { name, cel, conyuge_name, conyuge_cel,adress });
            
            res.render('registro', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });

        }
     } catch (error) {
            console.error(error);
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
        
    }

    export const editarClientes = async (req, res) => {
        if (req.session.rol == 'usuario') {
            const { id } = req.params;
            const { name, cel, conyuge_name, conyuge_cel, adress } = req.body;
            const [result] = await pool.query('UPDATE customer SET name = IFNULL (?, name), cel = IFNULL (?, cel), conyuge_name = IFNULL (?, conyuge_name), conyuge_cel = IFNULL (?, conyuge_cel), adress= IFNULL (?, adress) WHERE id = ?', [name, cel, conyuge_name,conyuge_cel, adress, id]);
        //otro if de si es mayor a 0?
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM customer');
        res.render('clientes', {
            alert: true,
            alertTitle: "Actualización",
            alertMessage: "¡Actualización Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes:rows,
            ruta:'clientes'
        });

       }} else if (req.session.rol == 'admin') {
            const { id } = req.params;
            const { name, cel, conyuge_name, conyuge_cel, adress } = req.body;
            const [result] = await pool.query('UPDATE customer SET name = IFNULL (?, name), cel = IFNULL (?, cel), conyuge_name = IFNULL (?, conyuge_name), conyuge_cel = IFNULL (?, conyuge_cel), adress= IFNULL (?, adress) WHERE id = ?', [name, cel, conyuge_name,conyuge_cel, adress, id]);
        //otro if de si es mayor a 0?
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM customer');
        res.render('clientes', {
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
            clientes:rows,
            ruta:'clientes'
        });
    } }else{
       
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
    }
 
    export const eliminarCliente = async (req, res) => {

        if (req.session.rol == 'admin') {
            const { id } = req.params;
            const [result]=await pool.query('DELETE FROM customer WHERE id=?',[id])
        //otro if de si es mayor a 0?
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM customer');
        res.render('clientes', {
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
            clientes:rows,
            ruta:'clientes'
        });
    } }else{
        // (error) 
        //     console.error(error);
            // Manejar el error apropiadamente
            res.status(500).send('Error interno del servidor');
        }
    }


// terreno
export const crearTerreno= async (req, res) => {
    try {
        const { id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        console.log(req.body.id_interno,req.body.calle, req.body.lote, req.body.manzana, req.body.superficie, req.body.precio, req.body.predial, req.body.escritura, req.body.estado);
         // Verificar si algún campo está vacío
         if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        await pool.query('INSERT INTO land SET ?', { id_interno, calle, lote, manzana,superficie,precio,predial,escritura,estado });
        
        res.render('terrenoAlta', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });
    } catch (error) {
        console.error(error);
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }

}


export const editarTerrenos = async (req, res) => {
    if (req.session.rol == 'usuario') {
        const { id } = req.params;
        const {id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        const [result] = await pool.query('UPDATE land SET id_interno  = IFNULL (?, id_interno), calle = IFNULL (?, calle), lote = IFNULL (?, lote), manzana = IFNULL (?, manzana), superficie = IFNULL (?, superficie), precio= IFNULL (?, precio), predial= IFNULL (?, predial), escritura= IFNULL (?, escritura), estado= IFNULL (?, estado)  WHERE id = ?', [id_interno, calle, lote, manzana,superficie, precio, predial, escritura, estado, id]);
    //otro if de si es mayor a 0?
    if (result && result.affectedRows > 0) {
        const [rows]=await pool.query('SELECT * FROM land');
    res.render('terrenos', {
        alert: true,
        alertTitle: "Actualización",
        alertMessage: "¡Actualización Exitoso",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 1500,
        login: true,
        roluser: false,
        name: req.session.name,
        rol: req.session.rol,
        terrenos:rows,
        ruta:'terrenos'
    });

   }} else if (req.session.rol == 'admin') {
    const { id } = req.params;
    const {id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
    const [result] = await pool.query('UPDATE land SET id_interno  = IFNULL (?, id_interno), calle = IFNULL (?, calle), lote = IFNULL (?, lote), manzana = IFNULL (?, manzana), superficie = IFNULL (?, superficie), precio= IFNULL (?, precio), predial= IFNULL (?, predial), escritura= IFNULL (?, escritura), estado= IFNULL (?, estado) WHERE id = ?', [id_interno, calle, lote, manzana,superficie, precio, predial, escritura, estado, id]);
    //otro if de si es mayor a 0?
    if (result && result.affectedRows > 0) {
        const [rows]=await pool.query('SELECT * FROM land');
    res.render('terrenos', {
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
        terrenos:rows,
        ruta:'terrenos'
    });
} }else{
   
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}




// ELIMINAR TERRENO

export const eliminarTerreno = async (req, res) => {

    if (req.session.rol == 'admin') {
        const { id } = req.params;
        const [result]=await pool.query('DELETE FROM land WHERE id=?',[id])
    //otro if de si es mayor a 0?
    if (result && result.affectedRows > 0) {
        const [rows]=await pool.query('SELECT * FROM land');
    res.render('terrenos', {
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
        terrenos:rows,
        ruta:'terrenos'
    });
} }else{
    // (error) 
    //     console.error(error);
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}



export const methods = {
    usuarios,
    editarUsuario,
    eliminarUsuario,
    crearCliente,
    editarClientes,
    eliminarCliente,
    crearTerreno,
    editarTerrenos,
    eliminarTerreno,
  }

