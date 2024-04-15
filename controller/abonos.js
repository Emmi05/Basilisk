
import { pool} from '../database/db.js'
import moment from 'moment';

import PDFDocument from "pdfkit-table";

// abonos
const numeros= /^\d+$/;

const crearAbonos = async (req, res) => {
    const id_venta = req.params.id;

    try {
        // Obtener los datos del cuerpo de la solicitud
        const { n_abono, fecha_abono, cantidad } = req.body;
         // Manejar la fecha de abono cuando no está presente
         const fechaAbono = fecha_abono || new Date();

        const [informacion]=await pool.query('SELECT  s.id AS venta_id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas AS abono_cuotas_pagadas, a.cuotas_restantes AS abono_cuotas_restantes, c.name AS customer_name, c.a_paterno AS customer_paterno, c.a_materno AS customer_materno, l.lote AS land_lote, l.manzana AS land_manzana, l.predial AS land_predial, l.id_interno AS land_id_interno, l.precio AS land_precio FROM  sale s JOIN  abonos a ON s.id = a.id_sale JOIN  customers c ON s.id_customer = c.id JOIN  land l ON s.id_land = l.id WHERE  s.id = ? ORDER BY  a.fecha_abono DESC LIMIT 1;',  [id_venta]);
        // Consulta para obtener detalles de la venta y el último abono

        const [abonosrows] = await pool.query('SELECT s.id, s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.id_land, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno  FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id   WHERE s.id = ? ORDER BY a.cuotas_restantes ASC LIMIT 1;', [id_venta]);
    
        

        // Verificar si algún campo está vacío
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
            if (!numeros.test(n_abono)) {
                return res.render('abonos_formulario', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El número de abono debe ser un número positivo sin caracteres especiales",
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
            }
            console.log(n_abono, "abono dado");
            console.log(cuotasFaltantes, "cuotas generales");

          

            const id_land=abonosrows[0].id_land;


            const cuota_restante = abonosrows[0].ncuotas_pagadas + parseFloat(n_abono); // Sumar n_abono a las cuotas pagadas

            // const cuota_restante = abonosrows[0].cuotas - abonosrows[0].ncuotas_pagadas; // Calcula cuotas restantes
           
            console.log(cuota_restante, "cuota pagada?");
            
            const cuota_pagada = abonosrows[0].cuotas_restantes - parseFloat(n_abono); // Restar n_abono a las cuotas restantes

            console.log(abonosrows[0].cuotas_restantes);
            console.log(cuota_pagada, "cuota restante");
            

            const deuda_restante = abonosrows[0].deuda_restante - cantidad;
            console.log(deuda_restante, "deuda restante ");
            console.log("-------------------------------------------------")

            ///aqui se valida los decimales 
            if(deuda_restante<=1){
                const deuda_restante=0;
                const id_sale = abonosrows[0].id;
                console.log(id_sale);
                 const [landsearch] = await pool.query('SELECT * FROM sale WHERE id = ?', [id_sale]);

                const id_land = landsearch[0].id_land;
            
                // Insertar el nuevo abono en la base de datos
                const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');

                const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes, cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
                [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada, cantidad, n_abono])

                   // Marcar el terreno como "proceso"
                 // await pool.query('UPDATE land SET estado = ? WHERE id = ?', ['pagado', id_land])

                .catch(error => {
                    console.error('Error al insertar el abono en la base de datos:', error);
                    throw error;
                });
    
                // // Obtener el ID del último abono insertado
                // const lastInsertedAbonoId = iabono.insertId;
    
                // Actualizar la venta con las nuevas cuotas pagadas y la deuda restante
                const result = await pool.query('UPDATE sale INNER JOIN land ON sale.id_land = land.id SET sale.ncuotas_pagadas = ?, sale.deuda_restante = ?, land.estado = ? WHERE sale.id = ? AND land.id = ?', [cuota_restante, deuda_restante, 'pagado', id_sale, id_land])
                    .catch(error => {
                        console.error('Error al actualizar las cuotas en la base de datos:', error);
                        throw error; 
                    });
             
              
    
               // Genera y envía el PDF
     await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);


            }else{
                const fechaAbonoFormateada = moment(fechaAbono).format('YYYY-MM-DD');

            
            // const cuota_pagada = abonosrows[0].cuotas_restantes - parseFloat(n_abono);
            // console.log(cuota_pagada, "cuota pagado");
            // ID de la venta
            const id_sale = abonosrows[0].id;
            
            // Insertar el nuevo abono en la base de datos
            const iabono = await pool.query('INSERT INTO abonos (id_sale, fecha_abono, cuotas_pagadas, cuotas_restantes,cantidad, n_abono) VALUES (?, ?, ?, ?, ?, ?)',
                [id_sale, fechaAbonoFormateada, cuota_restante, cuota_pagada,cantidad, n_abono])
                .catch(error => {
                    console.error('Error al insertar el abono en la base de datos:', error);
                    throw error;
                });

      
            // Actualizar la venta con las nuevas cuotas pagadas y la deuda restante
            const result = await pool.query('UPDATE sale SET ncuotas_pagadas = ?, deuda_restante = ? WHERE id = ?', [cuota_restante, deuda_restante, id_sale])
                .catch(error => {
                    console.error('Error al actualizar las cuotas en la base de datos:', error);
                    throw error; 
                });

            

            await generateAndSendPDF(informacion, cantidad,fechaAbonoFormateada, res);
            // res.json({ success: true });


        
      }
     }
    } catch (error) {
        console.error(error);
        return res.status(500).render('500');
        // res.status(500).send('Error interno del servidor');
    }
}

async function generateAndSendPDF(informacion,cantidad,fechaAbonoFormateada, res) {

        try {
    
            const doc = new PDFDocument();
            const buffers = [];
             const fechaAbono = moment(fechaAbonoFormateada, 'YYYY-MM-DD').toDate();
             const fechaEnLetras = formatFechaEnLetras(fechaAbono);
    
                 
          // Establecer la posición de la imagen
          const imgWidth = 100; // Ancho de la imagen
          const imgHeight = 80; // Alto de la imagen
          const imgX = doc.page.width - imgWidth - 30; // Posición X de la imagen (10 píxeles desde el borde derecho)
          const imgY = 10; // Posición Y de la imagen (10 píxeles desde el borde superior)
          doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
    
            // Agregar espacio
            doc.moveDown();
    
            const fecha = `Acapulco, Guerrero, a  ${fechaEnLetras}`;
            doc.text(fecha, {
                align: 'right' // Alinea el texto a la derecha
            });
    
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
    
            // Agregar el párrafo de lorem
            const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';
            doc.text(`Israel Nogueda Pineda, ${lorem}`, {
                // width: 410,
                align: 'justify'
            });
            doc.moveDown();
            doc.moveDown();
            // Agregar el párrafo del cliente
           
            const customerName = `Recibo de la C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} la cantidad de $ ${cantidad}  como pago parcial por el lote ${informacion[0].land_lote} de la manzana ${informacion[0].land_manzana}, operación pactada en $ ${informacion[0].land_precio}, los gastos de escrituración e  impuesto predial con número ${informacion[0].land_predial}, son por cuenta del comprador, según acuerdo entre las partes, ubicado en el Fraccionamiento Fuerza Aérea Mexicana, Municipio de Acapulco, Estado de Guerrero e identificado internamiento con la clave ${informacion[0].land_id_interno}, a fin de llevar a cabo la compra venta de dicho lote.  `;
            doc.text(customerName, {
                // width: 410,
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
    
            // Manejador para finalizar el documento
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                // Envía el PDF como respuesta
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=reporte.pdf',
                    'Content-Length': pdfData.length
                });
                // alert("hola");
                res.end(pdfData);
              

            });

            // Finaliza y cierra el documento PDF
            doc.end();
            // res.json({ success: true, message: 'PDF generado exitosamente.' });
    

        } catch (error) {
            console.error('Error en la generación del PDF:', error);
            // res.status(500).send('Error interno del servidor al generar el PDF');
        }
    
    }
 

    export const methods = {
      
        crearAbonos,
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