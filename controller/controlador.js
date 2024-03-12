import { pool} from '../database/db.js'
import moment from 'moment';

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
    export const crearCliente = async (req, res) => {
        try {
            if (req.session.rol == 'usuario' || req.session.rol == 'admin') {
                const { name, a_paterno, a_materno, cel, adress, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge } = req.body;
                console.log(req.body);
    
                const ejemplo = await pool.query('INSERT INTO customers SET ?', { name, a_paterno, a_materno, cel, adress });
    
                if (ejemplo) {
                    const [rows] = await pool.query('SELECT * FROM customers WHERE name = ? AND a_paterno = ? AND a_materno = ?', [name, a_paterno, a_materno]);
    
                    if (rows.length > 0) {
                        const customer_id = rows[0].id;
                        await pool.query('INSERT INTO parentesco SET ?', { customer_id, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge });
                        
                        // Renderizar vista
                        renderizarRegistro(req, res);
                    }
                }
            } else {
                // El rol no es válido
                res.status(403).send('Acceso denegado');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        }
    };
    
    function renderizarRegistro(req, res) {
        const roluser = (req.session.rol == 'admin');
        res.render('registro', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/',
            login: true,
            roluser: roluser,
            name: req.session.name,
            rol: req.session.rol,
        });
    }

    

    export const editarClientes = async (req, res) => {
        try {
            if (req.session.rol == 'usuario' || req.session.rol == 'admin') {
                const { id } = req.params;
                const { name, a_paterno, a_materno, cel, adress, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge } = req.body;
                
                // Actualizar los datos del cliente en la tabla customers
                const [result] = await pool.query('UPDATE customers SET name = IFNULL (?, name), a_paterno = IFNULL (?, a_paterno), a_materno = IFNULL (?, a_materno), cel = IFNULL (?, cel), adress= IFNULL (?, adress) WHERE id = ?', [name, a_paterno, a_materno, cel, adress, id]);
    
                // Verificar si la actualización fue exitosa
                if (result && result.affectedRows > 0) {
                    // Verificar si el cliente ya tiene un registro en la tabla parentesco
                    const [existingParentesco] = await pool.query('SELECT * FROM parentesco WHERE customer_id = ?', [id]);
    
                    if (existingParentesco && existingParentesco.length > 0) {
                        // Si existe un registro en la tabla parentesco, actualizarlo
                        await pool.query('UPDATE parentesco SET name_conyuge = ?, a_paterno_conyuge = ?, a_materno_conyuge = ?, cel_conyuge = ? WHERE customer_id = ?', [name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge, id]);
                    } else {
                        // Si no existe un registro en la tabla parentesco, insertar uno nuevo
                        await pool.query('INSERT INTO parentesco SET ?', { customer_id: id, name_conyuge, a_paterno_conyuge, a_materno_conyuge, cel_conyuge });
                    }
    
                    // Obtener los datos actualizados del cliente
                    const [clientes] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    
                    // Renderizar la vista
                    res.render('clientes', {
                        alert: true,
                        alertTitle: "Actualización",
                        alertMessage: "¡Actualización Exitoso",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        login: true,
                        roluser: req.session.rol === 'admin',
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: clientes,
                        ruta: 'clientes'
                    });
                } else {
                    // La actualización no fue exitosa
                    res.status(500).send('Error interno del servidor');
                }
            } else {
                // Rol no válido
                res.status(403).send('Acceso denegado');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        }
    };

    
    export const eliminarCliente = async (req, res) => {
        if (req.session.rol == 'admin') {
            const { id } = req.params;
            try {
                // Eliminar registros relacionados en la tabla parentezco
                await pool.query('DELETE FROM parentesco WHERE customer_id = ?', [id]);
                
                // Eliminar el cliente de la tabla customers
                const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
                if (result && result.affectedRows > 0) {
                    const [rows] = await pool.query('SELECT * FROM customers');
                    res.render('clientes', {
                        alert: true,
                        alertTitle: "Eliminado",
                        alertMessage: "¡Eliminado Exitoso!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                        ruta: 'clientes'
                    });
                } else {
                    res.status(404).send('Cliente no encontrado');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Error interno del servidor');
            }
        } else {
            res.status(403).send('Acceso denegado');
        }
    };
    


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


// venta crear
export const crearVenta = async (req, res) => {
    const terrenoId = req.params.id;
    const [terreno] = await pool.query('SELECT * FROM land WHERE id = ?', [terrenoId]);
    const [rows] = await pool.query('SELECT * FROM customers');
    const [rows2] = await pool.query('SELECT * FROM land');
    try {
        const { id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas } = req.body;

        // Verificar si algún campo está vacío
        if (!id_customer || !id_land || !fecha_venta || !tipo_venta) {
            return res.render('ventas', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos obligatorios!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/',
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        }

        // Formatear fecha
        const fechaFormateada = moment(fecha_venta).format('YYYY-MM-DD');

        // Insertar valores en la base de datos
        if (tipo_venta === 'contado') {
            // Verificar si falta algún campo obligatorio
            if (!id_customer || !id_land || !fecha_venta || !tipo_venta) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Debes rellenar todos los campos obligatorios!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            }
            await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta) VALUES (?, ?, ?, ?)', [id_customer, id_land, fechaFormateada, tipo_venta]);
        } else if (tipo_venta === 'credito') {
            // Verificar si falta algún campo obligatorio
            if (!id_customer || !id_land || !fecha_venta || !tipo_venta || !inicial || !n_cuentas) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Debes rellenar todos los campos obligatorios!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            }
            await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas) VALUES (?, ?, ?, ?, ?, ?)', [id_customer, id_land, fechaFormateada, tipo_venta, inicial, n_cuentas]);
        }

        res.render('ventas', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/',
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
            terrenos: rows2,
            terrenos2: terreno,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

export const editarVenta = async (req, res) => {
    let result; // Definir la variable result fuera de los bloques if y else

    try {
        const { id } = req.params;
        const { tipo_venta, inicial, n_cuentas } = req.body;

        // Verifica si el tipo de venta es "contado"
        if (tipo_venta === 'contado') {
            // Actualiza los datos normales y establece los valores de "inicial" y "n_cuentas" como null
            [result] = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = NULL, n_cuentas = NULL WHERE id = ?',
                [tipo_venta, id]
            );
        } else {
            // Si no es "contado", actualiza los valores normales
            [result] = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = ?, n_cuentas = ? WHERE id = ?',
                [tipo_venta, inicial, n_cuentas, id]
            );
        }

        if (result && result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM sale');
            res.render('venta', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitosa!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                ventas: rows,
                ruta: 'abonos'
            });
        }
    } catch (error) {
        console.error("Error al actualizar la venta:", error);
        // Manejar el error aquí
    }
};



  







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
    crearVenta,
    editarVenta
  }

