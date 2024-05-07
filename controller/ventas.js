import { pool} from '../database/db.js'
import moment from 'moment';

const cantidades = /^\d*,?\d+$/;

const crearVenta = async (req, res) => {
    const terrenoId = req.params.id;
    const [terreno] = await pool.query('SELECT * FROM land WHERE id = ?', [terrenoId]);
    const [rows] = await pool.query('SELECT * FROM customers');
    const [rows2] = await pool.query('SELECT * FROM land WHERE estado = ?', ['disponible']);
    
    const vendedor = req.session.name;
    const { id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas, cuotas, precio} = req.body;
    
    try {
        if (req.session.rol == 'admin') {

        const inicialNumber = parseFloat(inicial);
        const nCuentasNumber = parseFloat(n_cuentas);
    
        const deuda_restante = precio - inicial;

        // Verificar si algún campo está vacío o si los valores de 'inicial' y 'n_cuentas' no son números válidos
        if (!id_customer || !id_land || !fecha_venta || !tipo_venta) {
            return res.render('ventas', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos obligatorios.",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/',
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        }

        // Formatear fecha
        const fechaFormateada = moment(fecha_venta).format('YYYY-MM-DD');
  
        if (tipo_venta === 'credito') {
            if(inicialNumber <= 0 || !cantidades.test(inicial)) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de inicial son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            }

            if(nCuentasNumber <= 0 || !cantidades.test(n_cuentas)) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de n_cuentas son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            }
        }
         // Validar que el enganche no sea igual o mayor que el precio del terreno
         if (inicialNumber >= precio) {
            return res.render('ventas', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "La cantidad del enganche debe ser menor que el precio del terreno.",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/',
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        }
        // Insertar venta en la base de datos según el tipo de venta
        if (tipo_venta === 'contado') {
            // Insertar venta en la base de datos
           const ventas_contado= await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, vendedor, ncuotas_pagadas,cuotas, deuda_restante) VALUES (?, ?, ?, ?, ?,?,?,?)', [id_customer, id_land, fechaFormateada, tipo_venta, vendedor,0,0,0]);
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_land]);
            if(ventas_contado){
                const [contadorows] =  await pool.query('SELECT * FROM sale WHERE id_land = ? ', [id_land]);
                await pool.query('INSERT INTO abonos (id_sale, cuotas_restantes, fecha_abono, cuotas_pagadas, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)', [contadorows[0].id, 0, fechaFormateada, 0, 0, 0]);
 
             }
             return res.render('ventas', {
                alert: true,
                alertTitle: "Exito",
                alertMessage: "Venta registrada!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'ventas',
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        
    
         
            
        } else if (tipo_venta === 'credito') {
            const fechaFormateada = moment(fecha_venta).format('YYYY-MM-DD');

            // Insertar venta a crédito en la base de datos
           const ventasearch = await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas, vendedor, cuotas, deuda_restante, ncuotas_pagadas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)', [id_customer, id_land, fechaFormateada, tipo_venta, inicial, n_cuentas, vendedor, cuotas, deuda_restante,0]);
           console.log(ventasearch)
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['proceso', id_land]);

            if(ventasearch){
               const [ventasrows] =  await pool.query('SELECT * FROM sale WHERE id_land = ? ', [id_land]);
               await pool.query('INSERT INTO abonos (id_sale, cuotas_restantes, fecha_abono, cuotas_pagadas, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)', [ventasrows[0].id, n_cuentas, fechaFormateada, 0, 0, 0]);
            }
        

        return res.render('ventas', {
            alert: true,
            alertTitle: "Exito",
            alertMessage: "Venta registrada!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'ventas',
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
            terrenos: rows2,
            terrenos2: terreno,
        });
    }
   
        }    else if (req.session.rol == 'usuario') {

            const inicialNumber = parseFloat(inicial);
            const nCuentasNumber = parseFloat(n_cuentas);
        
            const deuda_restante = precio - inicial;
    
            if (!id_customer || !id_land || !fecha_venta || !tipo_venta) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Debes rellenar todos los campos obligatorios.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
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
    
            const fechaFormateada = moment(fecha_venta).format('YYYY-MM-DD');
      
            if (tipo_venta === 'credito') {
                if(inicialNumber <= 0 || !cantidades.test(inicial)) {
                    return res.render('ventas', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Los valores de inicial son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
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
    
                if(nCuentasNumber <= 0 || !cantidades.test(n_cuentas)) {
                    return res.render('ventas', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Los valores de n_cuentas son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: '/',
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        clientes: rows,
                        terrenos: rows2,
                        terrenos2: terreno,
                    });
                }
            }
             if (inicialNumber >= precio) {
                return res.render('ventas', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "La cantidad del enganche debe ser menor que el precio del terreno.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
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
            if (tipo_venta === 'contado') {
               const ventas_contado= await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, vendedor, ncuotas_pagadas,cuotas, deuda_restante) VALUES (?, ?, ?, ?, ?,?,?,?)', [id_customer, id_land, fechaFormateada, tipo_venta, vendedor,0,0,0]);
                await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_land]);
                if(ventas_contado){
                    const [contadorows] =  await pool.query('SELECT * FROM sale WHERE id_land = ? ', [id_land]);
                    await pool.query('INSERT INTO abonos (id_sale, cuotas_restantes, fecha_abono, cuotas_pagadas, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)', [contadorows[0].id, 0, fechaFormateada, 0, 0, 0]);
     
                 }
                 return res.render('ventas', {
                    alert: true,
                    alertTitle: "Exito",
                    alertMessage: "Venta registrada!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'ventas',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    clientes: rows,
                    terrenos: rows2,
                    terrenos2: terreno,
                });
            
            } else if (tipo_venta === 'credito') {
                const fechaFormateada = moment(fecha_venta).format('YYYY-MM-DD');
                const ventasearch = await pool.query('INSERT INTO sale (id_customer, id_land, fecha_venta, tipo_venta, inicial, n_cuentas, vendedor, cuotas, deuda_restante, ncuotas_pagadas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)', [id_customer, id_land, fechaFormateada, tipo_venta, inicial, n_cuentas, vendedor, cuotas, deuda_restante,0]);
               
                await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['proceso', id_land]);
    
                if(ventasearch){
                   const [ventasrows] =  await pool.query('SELECT * FROM sale WHERE id_land = ? ', [id_land]);
                   await pool.query('INSERT INTO abonos (id_sale, cuotas_restantes, fecha_abono, cuotas_pagadas, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)', [ventasrows[0].id, n_cuentas, fechaFormateada, 0, 0, 0]);
                }
            
            return res.render('ventas', {
                alert: true,
                alertTitle: "Exito",
                alertMessage: "Venta registrada!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'ventas',
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                clientes: rows,
                terrenos: rows2,
                terrenos2: terreno,
            });
        }
       
            }
    } catch (error) {
        console.error(error);
        return res.status(500).render('500');
    }
}

const editarVenta = async (req, res) => {
  
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, l.id_interno, s.fecha_venta, s.n_cuentas, s.inicial, s.tipo_venta, s.cuotas, s.id FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id]);
        const { tipo_venta, inicial, n_cuentas, cuotas } = req.body;
        const inicialNumber = parseFloat(inicial);
        const nCuentasNumber = parseFloat(n_cuentas);

         let result = null;
        const [venta] = await pool.query('SELECT id_land FROM sale WHERE id = ?', [id]);
        const id_terreno_asociado = venta[0].id_land;
     
        const [terreno] = await pool.query('SELECT estado, precio FROM land WHERE id = ?', [id_terreno_asociado]);
        const estado_terreno = terreno[0].estado;
        const precio_terreno = terreno[0].precio;

        if (req.session.rol=='admin'){

            if (tipo_venta === 'contado' && estado_terreno !== 'pagado') {
                result = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = NULL, n_cuentas = NULL, cuotas = 0 WHERE id = ?',
                [tipo_venta, id]
            );


            // Marcar el terreno como "pagado"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_terreno_asociado]);
        } else if (tipo_venta === 'credito') {
            if((inicialNumber >= precio_terreno)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El enganche debe ser menor que el precio del terreno.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }
            if(inicialNumber <= 0 || !cantidades.test(inicial)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de inicial son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }
            if(nCuentasNumber <= 0 || !cantidades.test(n_cuentas)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de n_cuentas son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }

            // Si es "crédito", actualiza los valores normales
            result = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = ?, n_cuentas = ?, cuotas = ? WHERE id = ?',
                [tipo_venta, inicial, n_cuentas, cuotas, id]
            );
        
            // Marcar el terreno como "proceso"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['proceso', id_terreno_asociado]);
        }
    
        
        res.render('venta', {
            alert: true,
            alertTitle: "Actualización",
            alertMessage: "¡Actualización Exitosa!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
            ruta: '/'
        });
        }else if (req.session.rol =='usuario'){
            if (tipo_venta === 'contado' && estado_terreno !== 'pagado') {
                result = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = NULL, n_cuentas = NULL, cuotas = 0 WHERE id = ?',
                [tipo_venta, id]
            );


            // Marcar el terreno como "pagado"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_terreno_asociado]);
        } else if (tipo_venta === 'credito') {
            if((inicialNumber >= precio_terreno)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El enganche debe ser menor que el precio del terreno.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }
            if(inicialNumber <= 0 || !cantidades.test(inicial)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de inicial son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }
            if(nCuentasNumber <= 0 || !cantidades.test(n_cuentas)) {
                return res.render('ventaEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Los valores de n_cuentas son inválidos. Deben ser mayor a 0 y sin caracteres especiales.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/',
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    ventas: rows,
                    terrenos2: terreno,
                });
            }

            // Si es "crédito", actualiza los valores normales
            result = await pool.query(
                'UPDATE sale SET tipo_venta = ?, inicial = ?, n_cuentas = ?, cuotas = ? WHERE id = ?',
                [tipo_venta, inicial, n_cuentas, cuotas, id]
            );
        
            // Marcar el terreno como "proceso"
            await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['proceso', id_terreno_asociado]);
        }
    
        
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
            ruta: '/'
        });

        }
    } catch (error) {
        // console.error("Error al actualizar la venta:", error);
        res.status(500).send('Error al actualizar la venta');
    }
};



const eliminarVenta = async (req, res) => {
    const ventaId = req.params.id;

    const [venta] = await pool.query('SELECT id_land FROM sale WHERE id = ?', [ventaId]);

    const id_terreno_asociado = venta[0].id_land;

// Después de eliminar la venta
const [result] = await pool.query('DELETE FROM sale WHERE id=?', [ventaId]);
if (result && result.affectedRows > 0) {
    // Actualizar el estado del terreno
    const [updateResult] = await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['disponible', id_terreno_asociado]);
    if (updateResult && updateResult.affectedRows > 0) {
        // Renderizar la página con el mensaje de eliminación exitosa
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, s.fecha_venta, s.n_cuentas, s.ncuotas_pagadas, s.id, s.tipo_venta FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id;');

        res.render('venta', {
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
            ventas: rows,
            ruta: 'view_venta'
        });
    } else {
        // Manejar el caso en que no se pudo actualizar el estado del terreno
        res.status(500).send('Error al actualizar el estado del terreno');
    }
} else {
    // Manejar el caso en que no se pudo eliminar la venta
    res.status(500).send('Error al eliminar la venta');
}

}

export const methods = {
   
    crearVenta,
    editarVenta,
    eliminarVenta,
  }

