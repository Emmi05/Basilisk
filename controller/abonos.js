
import { pool} from '../database/db.js'
import moment from 'moment';

import PDFDocument from "pdfkit-table";

// abonos
const numeros= /^\d+$/;

const crearAbonos = async (req, res) => {
    const id_venta = req.params.id;

    try {
      if (req.session.rol==1){
        const { n_abono, fecha_abono, cantidad } = req.body;
        // Manejar la fecha de abono cuando no está presente
        const fechaAbono = fecha_abono || new Date();
       const [informacion]=await pool.query('SELECT  s.id AS venta_id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas AS abono_cuotas_pagadas, a.cuotas_restantes AS abono_cuotas_restantes, c.name AS customer_name, c.a_paterno AS customer_paterno, c.a_materno AS customer_materno, l.lote AS land_lote, l.manzana AS land_manzana, l.predial AS land_predial, l.id_interno AS land_id_interno, l.precio AS land_precio FROM  sale s JOIN  abonos a ON s.id = a.id_sale JOIN  customers c ON s.id_customer = c.id JOIN  land l ON s.id_land = l.id WHERE  s.id = ? ORDER BY  a.fecha_abono DESC LIMIT 1;',  [id_venta]);
       const [abonosrows] = await pool.query('SELECT s.id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.id_land, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno  FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id   WHERE s.id = ? ORDER BY a.cuotas_restantes ASC LIMIT 1;', [id_venta]);
       if (!n_abono || !fecha_abono) {
           // Renderizar la vista con un mensaje de error si faltan campos
           return res.render('abonos_formulario', {
               alert: true,
               alertTitle: "Error",
               alertMessage: "Debes rellenar todos los campos obligatorios!",
               alertIcon: 'error',
               showConfirmButton: false,
               timer: 1500,
               ruta: '/',
               login: true,
               roluser: true,
               name: req.session.name,
               rol: req.session.rol,
               abonos: abonosrows,
           });
       } else if (abonosrows[0].cuotas_pagadas <= abonosrows[0].n_cuentas) {
           const cuotasFaltantes = abonosrows[0].cuotas_restantes;
           // Verificar si n_abono es un número positivo
           if (n_abono >abonosrows[0].cuotas_restantes) {
               return res.render('abonos_formulario', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El número de abono no debe ser mayor a cuotas restantes",
                   alertIcon: 'error',
                   showConfirmButton: true,
                   timer: false,
                   ruta: '/',
                   login: true,
                   roluser: true,
                   name: req.session.name,
                   rol: req.session.rol,
                   abonos: abonosrows,
               });
           }

           if (!numeros.test(n_abono) || n_abono==0) {
               return res.render('abonos_formulario', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El número de abono debe ser un número positivo sin caracteres especiales",
                   alertIcon: 'error',
                   showConfirmButton: true,
                   timer: false,
                   ruta: '/',
                   login: true,
                   roluser: true,
                   name: req.session.name,
                   rol: req.session.rol,
                   abonos: abonosrows,
               });
           }
           const id_land=abonosrows[0].id_land;
           const cuota_restante = abonosrows[0].ncuotas_pagadas + parseFloat(n_abono);        
           const cuota_pagada = abonosrows[0].cuotas_restantes - parseFloat(n_abono); 
           const deuda_restante = abonosrows[0].deuda_restante - cantidad;
       
           ///aqui se valida los decimales 
           if(deuda_restante<=1){

               const deuda_restante=0;
               const id_sale = abonosrows[0].id;
               const [landsearch] = await pool.query('SELECT * FROM sale WHERE id = ?', [id_sale]);
               const id_land = landsearch[0].id_land;
               // Insertar el nuevo abono en la base de datos
               const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');
               const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
               [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada, cantidad, n_abono])

               .catch(error => {
                   console.error('Error al insertar el abono en la base de datos:', error);
                   throw error;
               });
                 // SI YA TERMINO DE PAGAR
               const result = await pool.query('UPDATE sale INNER JOIN land ON sale.id_land = land.id SET sale.ncuotas_pagadas = ?, sale.deuda_restante = ?, land.estado = ? WHERE sale.id = ? AND land.id = ?', [cuota_restante, deuda_restante, 'pagado', id_sale, id_land])
                   .catch(error => {
                       console.error('Error al actualizar las cuotas en la base de datos:', error);
                       throw error; 
                   });

            await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);

           }else{
               const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');

           const id_sale = abonosrows[0].id;
           const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes,cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
               [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada,cantidad, n_abono])
               .catch(error => {
                   console.error('Error al insertar el abono en la base de datos:', error);
                   throw error;
               });
           const result = await pool.query('UPDATE sale SET ncuotas_pagadas = ?, deuda_restante = ? WHERE id = ?', [cuota_restante, deuda_restante, id_sale])
               .catch(error => {
                   console.error('Error al actualizar las cuotas en la base de datos:', error);
                   throw error; 
               });
           await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);
     }
    }
      }else{
        const { n_abono, fecha_abono, cantidad } = req.body;
        // Manejar la fecha de abono cuando no está presente
        const fechaAbono = fecha_abono || new Date();
       const [informacion]=await pool.query('SELECT  s.id AS venta_id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas AS abono_cuotas_pagadas, a.cuotas_restantes AS abono_cuotas_restantes, c.name AS customer_name, c.a_paterno AS customer_paterno, c.a_materno AS customer_materno, l.lote AS land_lote, l.manzana AS land_manzana, l.predial AS land_predial, l.id_interno AS land_id_interno, l.precio AS land_precio FROM  sale s JOIN  abonos a ON s.id = a.id_sale JOIN  customers c ON s.id_customer = c.id JOIN  land l ON s.id_land = l.id WHERE  s.id = ? ORDER BY  a.fecha_abono DESC LIMIT 1;',  [id_venta]);
       const [abonosrows] = await pool.query('SELECT s.id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.id_land, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno  FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id   WHERE s.id = ? ORDER BY a.cuotas_restantes ASC LIMIT 1;', [id_venta]);
       if (!n_abono || !fecha_abono) {
           // Renderizar la vista con un mensaje de error si faltan campos
           return res.render('abonos_formulario', {
               alert: true,
               alertTitle: "Error",
               alertMessage: "Debes rellenar todos los campos obligatorios!",
               alertIcon: 'error',
               showConfirmButton: true,
               timer: false,
               ruta: '/',
               login: true,
               roluser: false,
               name: req.session.name,
               rol: req.session.rol,
               abonos: abonosrows,
           });
       } else if (abonosrows[0].cuotas_pagadas <= abonosrows[0].n_cuentas) {
           const cuotasFaltantes = abonosrows[0].cuotas_restantes;
           // Verificar si n_abono es un número positivo
           if (n_abono >abonosrows[0].cuotas_restantes) {
               return res.render('abonos_formulario', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El número de abono no debe ser mayor a cuotas restantes",
                   alertIcon: 'error',
                   showConfirmButton: true,
                   timer: false,
                   ruta: '/',
                   login: true,
                   roluser: false,
                   name: req.session.name,
                   rol: req.session.rol,
                   abonos: abonosrows,
               });
           }

           if (!numeros.test(n_abono)) {
               return res.render('abonos_formulario', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El número de abono debe ser un número positivo sin caracteres especiales",
                   alertIcon: 'error',
                   showConfirmButton: true,
                   timer: false,
                   ruta: '/',
                   login: true,
                   roluser: false,
                   name: req.session.name,
                   rol: req.session.rol,
                   abonos: abonosrows,
               });
           }
           const id_land=abonosrows[0].id_land;
           const cuota_restante = abonosrows[0].ncuotas_pagadas + parseFloat(n_abono);        
           const cuota_pagada = abonosrows[0].cuotas_restantes - parseFloat(n_abono); 
           const deuda_restante = abonosrows[0].deuda_restante - cantidad;
       
           ///aqui se valida los decimales 
           if(deuda_restante<=1){

               const deuda_restante=0;
               const id_sale = abonosrows[0].id;
               const [landsearch] = await pool.query('SELECT * FROM sale WHERE id = ?', [id_sale]);
               const id_land = landsearch[0].id_land;
               // Insertar el nuevo abono en la base de datos
               const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');
               const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
               [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada, cantidad, n_abono])

               .catch(error => {
                   console.error('Error al insertar el abono en la base de datos:', error);
                   throw error;
               });
                 // SI YA TERMINO DE PAGAR
               const result = await pool.query('UPDATE sale INNER JOIN land ON sale.id_land = land.id SET sale.ncuotas_pagadas = ?, sale.deuda_restante = ?, land.estado = ? WHERE sale.id = ? AND land.id = ?', [cuota_restante, deuda_restante, 'pagado', id_sale, id_land])
                   .catch(error => {
                       console.error('Error al actualizar las cuotas en la base de datos:', error);
                       throw error; 
                   });

            await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);

           }else{
               const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');

           const id_sale = abonosrows[0].id;
           const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes,cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
               [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada,cantidad, n_abono])
               .catch(error => {
                   console.error('Error al insertar el abono en la base de datos:', error);
                   throw error;
               });
           const result = await pool.query('UPDATE sale SET ncuotas_pagadas = ?, deuda_restante = ? WHERE id = ?', [cuota_restante, deuda_restante, id_sale])
               .catch(error => {
                   console.error('Error al actualizar las cuotas en la base de datos:', error);
                   throw error; 
               });
           await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);
     }
    }
      }
    } catch (error) {
        console.error(error);
        return res.status(500).render('500');
    }
}

async function generateAndSendPDF(informacion,cantidad,fechaAbonoFormateada, res) {
        try {
            const doc = new PDFDocument();
            const buffers = [];
            const fechaAbono = moment(fechaAbonoFormateada, 'YYYY-MM-DD').toDate();
            const fechaEnLetras = formatFechaEnLetras(fechaAbono);

            const imgWidth = 100; 
            const imgHeight = 80;
            const imgX = doc.page.width - imgWidth - 30;
            const imgY = 10; 
            
            doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
            doc.moveDown();
            const fecha = `Acapulco, Guerrero, a  ${fechaEnLetras}`;
            doc.text(fecha, {
                align: 'right' 
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
           
            const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';
            doc.text(`Israel Nogueda Pineda, ${lorem}`, {
                align: 'justify'
            });
            doc.moveDown();
            doc.moveDown();
            const customerName = `Recibo de la C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} la cantidad de $ ${cantidad}  como pago parcial por el lote ${informacion[0].land_lote} de la manzana ${informacion[0].land_manzana}, operación pactada en $ ${informacion[0].land_precio}, los gastos de escrituración e  impuesto predial con número ${informacion[0].land_predial}, son por cuenta del comprador, según acuerdo entre las partes, ubicado en el Fraccionamiento Fuerza Aérea Mexicana, Municipio de Acapulco, Estado de Guerrero e identificado internamiento con la clave ${informacion[0].land_id_interno}, a fin de llevar a cabo la compra venta de dicho lote.  `;
            doc.text(customerName, {
                align: 'justify'// Alinea el texto
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            const extra = `Basilisk Inmobiliaria Siete, S. de R.L de C.V `;
            doc.text(extra, {
                align: 'justify'// Alinea el texto
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            const firma  = `Israel Nogueda Pineda  `;
            doc.text(firma, {
                align: 'justify'
            });
            const apoderado  = `Apoderado.  `;
            doc.text(apoderado, {
                align: 'justify'
            });
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
         
            const nombrelogo  = `B A S I L I S K  `;
            doc.text(nombrelogo, {
                align: 'center'
            });// Ajusta la posición vertical del pie de página
          const footerY = doc.page.height - 20;
    
          // Dibuja la línea horizontal
              const lineY = footerY - 30; // Ajusta la posición vertical de la línea
              doc.lineCap('butt')
                  .moveTo(50, lineY)
                  .lineTo(doc.page.width - 50, lineY)
                  .stroke();
      
    
            // Manejador para agregar datos al buffer
            doc.on('data', buffers.push.bind(buffers));
    
            
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
              
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=reporte.pdf',
                    'Content-Length': pdfData.length
                });
                // alert("hola");
                res.end(pdfData);
              

            });

            doc.end();
    

        } catch (error) {
            console.error('Error en la generación del PDF:', error);
        }
    
    }

 
const abonos_vista = async (req, res) => {
    if (req.session.rol == '2') {
        const [rows] = await pool.query('SELECT  c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.estado, l.id_interno, s.n_cuentas,  s.deuda_restante,  s.id, s.tipo_venta, s.inicial, s.cuotas, MAX(a.cuotas_pagadas) as cuotas_pagadas,  (SELECT a2.cuotas_restantes FROM abonos a2 WHERE a2.id_sale = s.id AND a2.cuotas_pagadas = MAX(a.cuotas_pagadas)) as cuotas_restantes FROM   sale s  JOIN customers c ON s.id_customer = c.id  JOIN  abonos a ON a.id_sale = s.id JOIN   land l ON s.id_land = l.id  WHERE  s.tipo_venta = "credito" && l.estado = "proceso" GROUP BY  s.id ORDER BY MAX(a.cuotas_pagadas) DESC; ');
    
        res.render('abonos_vista', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
        });
    } else if (req.session.rol == '1') {
        const [rows] = await pool.query('SELECT  c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.estado, l.id_interno, s.n_cuentas,  s.deuda_restante,  s.id, s.tipo_venta, s.inicial, s.cuotas, MAX(a.cuotas_pagadas) as cuotas_pagadas,  (SELECT a2.cuotas_restantes FROM abonos a2 WHERE a2.id_sale = s.id AND a2.cuotas_pagadas = MAX(a.cuotas_pagadas)) as cuotas_restantes FROM   sale s  JOIN customers c ON s.id_customer = c.id  JOIN  abonos a ON a.id_sale = s.id JOIN   land l ON s.id_land = l.id  WHERE  s.tipo_venta = "credito" && l.estado = "proceso" GROUP BY  s.id ORDER BY MAX(a.cuotas_pagadas) DESC; ');

        res.render('abonos_vista', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
        });
    }

}

const abonos_formulario = async (req, res) => {
    const id = req.params.id;

    if (req.session.rol == '2') {

        const [rows]=await pool.query(`SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.id_interno, s.n_cuentas, s.id, s.tipo_venta, s.inicial,  s.deuda_restante, s.cuotas, a.cuotas_pagadas, a.cuotas_restantes  FROM sale s  JOIN customers c ON s.id_customer = c.id  JOIN abonos a ON a.id_sale = s.id  JOIN land l ON s.id_land = l.id WHERE s.tipo_venta = "credito" && s.id=${id} ORDER BY cuotas_restantes ASC LIMIT 1`);        
        res.render('abonos_formulario', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
     
  
        });
    } else if (req.session.rol == '1') {
       const [rows]=await pool.query(`SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.id_interno, s.n_cuentas, s.id, s.tipo_venta, s.inicial,  s.deuda_restante, s.cuotas, a.cuotas_pagadas, a.cuotas_restantes  FROM sale s  JOIN customers c ON s.id_customer = c.id  JOIN abonos a ON a.id_sale = s.id  JOIN land l ON s.id_land = l.id  WHERE s.tipo_venta = "credito" && s.id=${id} ORDER BY cuotas_restantes ASC LIMIT 1`);
       res.render('abonos_formulario', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
       
        });
    }

}

export const methods = {
    crearAbonos,
    abonos_vista,
    abonos_formulario,
 }
    
      // Función para obtener el día en letras
function getDiaEnLetras(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dia = fecha.getDay();
    return dias[dia];
}

// Función para obtener el mes en letras
function getMesEnLetras(fecha) {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mes = fecha.getMonth();
    return meses[mes];
}

// Función para formatear la fecha
function formatFechaEnLetras(fecha) {
    const dia = getDiaEnLetras(fecha);
    const mes = getMesEnLetras(fecha);
    const año = fecha.getFullYear();
    return `${dia} ${fecha.getDate()} de ${mes} de ${año}`;
}