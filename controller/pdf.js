
import { pool} from '../database/db.js'
import PDFDocument from "pdfkit-table";


const crearPdf = async (req, res) => {
    const id_venta = req.params.id;

    try {
        const [rows] = await pool.query('SELECT s.*, c.name AS customer_name, c.a_materno, c.a_paterno, l.lote, l.manzana, l.precio, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, a.n_abono, a.cantidad FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id_venta]);
        
        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los abonos que se han proporcionado desde la fecha de compra - venta del terreno. (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
    
        // Agrega información de la venta
        const nCuotasVenta = rows[0].n_cuentas;
        const cliente = rows[0].customer_name;
        const apellidopa = rows[0].a_paterno;
        const apellidoma = rows[0].a_materno;
        const terreno = rows[0].lote;
        const manzana = rows[0].manzana;
        const precio = rows[0].precio;
        const deuda = rows[0].deuda_restante;
        const precioFormateado = precio.toLocaleString();
        const inicial = rows[0].inicial;
        const inicialFormateado=inicial.toLocaleString();

        // Concatena las variables en una sola cadena
const infoVenta = `Número de Cuotas Total: ${nCuotasVenta} | Nombre cliente: ${cliente} ${apellidopa} ${apellidoma} | Venta del terreno: ${terreno}, Manzana: ${manzana} | Precio terreno: ${precioFormateado} | Enganche: ${inicialFormateado} | Deuda actual: ${deuda}`;

// Agrega el texto al documento
doc.text(infoVenta, { align: 'left' });

        const table = {
            title: "Abonos",
            subtitle: "Historial",
            headers: [
                { label: "Fecha", property: 'fecha_abono', width: 120 },
                { label: "N.Cuotas", property: 'n_abono', width: 120 }, 
                { label: "C.Restantes", property: 'cuotas_restantes', width: 120 }, 
                { label: "Abono", property: 'cantidad', width: 120 }
            ],
            rows: []
        };
        
        // Agrega datos de abonos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const abono = rows[i];
            const fechaAbono = new Date(abono.fecha_abono);
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaAbono.toLocaleDateString('es-ES', options); // 'es-ES' es el código de idioma para español
        
            // Agregar cada fila de abono a la tabla
            table.rows.push([
                fechaFormateada,
                abono.n_abono,
                abono.cuotas_restantes,
                abono.cantidad

            ]);
        }
      

        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11), 
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(11); 
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
      // Ajusta la posición vertical del pie de página
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
                'Content-Disposition': 'attachment; filename=Venta.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        // res.status(500).send('Error interno del servidor al generar el PDF');
        return res.status(500).render('pdferror');

    }
}

const contado = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT s.*, c.name AS customer_name, c.a_materno, c.a_paterno, s.fecha_venta, l.precio, l.lote, l.manzana FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.tipo_venta = "contado";');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
        

        // Agrega datos de ventas de terrenos a la tabla
for (let i = 0; i < rows.length; i++) {
    const venta = rows[i];
    // console.log('Lote:', venta.lote, 'Manzana:', venta.manzana); // Agrega este console.log para verificar los valores de lote y manzana
    // Resto del código para construir las filas de la tabla...
}

        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que se han vendido a contado (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos Vendidos contado",
            subtitle: "Historial de compras a contado",
            headers: [
                { label: "Fecha", property: 'fecha_venta', width: 70 },
                { label: "Cliente", property: 'customer_name', width: 200 }, 
                { label: "Precio", property: 'precio', width: 100 },
                { label: "L", property: 'lote', width: 50 }, 
                { label: "M", property: 'manzana', width: 50 } 
            ],
            rows: []
        };
        
        
        // Agrega datos de ventas de terrenos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const venta = rows[i];
        
            // Crear una instancia de fecha a partir de venta.fecha_venta
            const fechaVenta = new Date(venta.fecha_venta);
        
            // Formatear la fecha como dd/mm/yyyy
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaVenta.toLocaleDateString('es-ES', options); // 'es-ES' es el código de idioma para español
        
            // Agregar cada fila de venta de terreno a la tabla
            table.rows.push([
                fechaFormateada,
                `${venta.customer_name} ${venta.a_paterno} ${venta.a_materno}`,
                venta.precio,
                venta.lote, // Agregar el valor del lote
                venta.manzana // Agregar el valor de la manzana
            ]);
        }

        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(12); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
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
                'Content-Disposition': 'attachment; filename=contado.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        // res.status(500).send('Error interno del servidor al generar el PDF');
        return res.status(500).render('pdferror');

    }
}

const proceso = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT s.*, c.name AS customer_name, c.a_materno, c.a_paterno, s.fecha_venta, s.ncuotas_pagadas, l.precio, l.lote, l.manzana FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.tipo_venta = "credito";');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
        

         // Agrega datos de ventas de terrenos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const venta = rows[i];
            // console.log('Lote:', venta.lote, 'Manzana:', venta.manzana); //
        }

        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que se han vendido a credito (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos Vendidos credito",
            subtitle: "Historial de compras a contado",
            headers: [
                { label: "Fecha", property: 'fecha_venta', width: 70 },
                { label: "Cliente", property: 'customer_name', width: 200 }, 
                { label: "Precio", property: 'precio', width: 100 },
                { label: "L", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 50 } ,
                { label: "C.P", property: 'ncuotas_pagadas', width: 50 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de ventas de terrenos a la tabla
        for (let i = 0; i < rows.length; i++) {
            const venta = rows[i];
        
            // Crear una instancia de fecha a partir de venta.fecha_venta
            const fechaVenta = new Date(venta.fecha_venta);
        
            // Formatear la fecha como dd/mm/yyyy
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaVenta.toLocaleDateString('es-ES', options); // 'es-ES' es el código de idioma para español
        
            // Agregar cada fila de venta de terreno a la tabla
            table.rows.push([
                fechaFormateada,
                `${venta.customer_name} ${venta.a_paterno} ${venta.a_materno}`,
                venta.precio,
                venta.lote, // Agregar el valor del lote
                venta.manzana,
                venta.ncuotas_pagadas // Agregar el valor de la manzana
            ]);
        }

        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(12); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
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
                'Content-Disposition': 'attachment; filename=proceso.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        // res.status(500).send('Error interno del servidor al generar el PDF');
        return res.status(500).render('pdferror');

    }
}

const disponibles = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT * FROM LAND WHERE estado = "disponible"');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
  
        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que estan disponibles (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos disponibles",
            subtitle: "Historial de terrenos disponibles",
            headers: [
                { label: "id_Interno", property: 'id_interno', width: 100 },
                { label: "calle", property: 'calle', width: 100 }, 
                { label: "l", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 70 } ,
                { label: "S", property: 'superficie', width: 50 } ,
                { label: "P", property: 'predial', width:100 } ,
                { label: "E", property: 'escritura', width: 20 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de terrenos disponibles a la tabla
        for (let i = 0; i < rows.length; i++) {
            const terreno = rows[i];
            
            // Agregar cada fila de terreno disponible a la tabla
            table.rows.push([
                terreno.id_interno,
                terreno.calle,
                terreno.lote,
                terreno.manzana,
                terreno.superficie,
                terreno.predial,
                terreno.escritura
            ]);
        }


        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(12); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
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
                'Content-Disposition': 'attachment; filename=disponibles.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        // res.status(500).send('Error interno del servidor al generar el PDF');
        return res.status(500).render('pdferror');
    }
}


const pagados = async (req, res) => {
  

    try {
        const [rows] = await pool.query('SELECT * FROM LAND WHERE estado = "pagado"');

        // Inicializa el documento PDF
        const doc = new PDFDocument();
        const buffers = [];
        
        // Agrega la imagen
        const imgWidth = 100;
        const imgHeight = 80;
        const imgX = doc.page.width - imgWidth - 30;
        const imgY = 10;
        doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });
  
        // Agregar (fecha de generación del PDF)
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Agrega espacio y texto de descripción
        doc.moveDown();
        doc.moveDown();
        const lorem = `A continuación se mostrarán todos los terrenos que estan pagados (Esto solo es un historial) creado el día ${fechaActual}`;
        doc.text(` ${lorem}`, { align: 'justify' });
        doc.moveDown();
    
        const table = {
            title: "Terrenos Pagados",
            subtitle: "Historial de terrenos pagados",
            headers: [
                { label: "id_Interno", property: 'id_interno', width: 100 },
                { label: "calle", property: 'calle', width: 100 }, 
                { label: "L", property: 'lote', width: 50 }, // Debe ser 'lote' en lugar de 'Lote'
                { label: "M", property: 'manzana', width: 70 } ,
                { label: "S", property: 'superficie', width: 50 } ,
                { label: "P", property: 'predial', width:100 } ,
                { label: "E", property: 'escritura', width: 20 } // Debe ser 'manzana' en lugar de 'Manzana'
            ],
            rows: []
        };
        
        
        // Agrega datos de terrenos disponibles a la tabla
        for (let i = 0; i < rows.length; i++) {
            const terreno = rows[i];
            
            // Agregar cada fila de terreno disponible a la tabla
            table.rows.push([
                terreno.id_interno,
                terreno.calle,
                terreno.lote,
                terreno.manzana,
                terreno.superficie,
                terreno.predial,
                terreno.escritura
            ]);
        }


        // Genera la tabla en el PDF
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11), // Ajusta el tamaño de fuente del encabezado
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(11); // Ajusta el tamaño de fuente de las celdas
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15); // Establece el color de fondo para la primera columna
            },
        });
        
        // Ajusta la posición vertical del pie de página
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
                'Content-Disposition': 'attachment; filename=pagados.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        // Envía una respuesta de error al cliente si falla la generación del PDF
        // res.status(500).send('Error interno del servidor al generar el PDF');
        return res.status(500).render('pdferror');
    }
}

const finiquito =async (req,res)=>{
    const id_venta = req.params.id;
    const [informacion]=await pool.query('SELECT  s.id AS venta_id, MAX(a.fecha_abono) AS ultima_fecha_abono,  c.name AS customer_name, c.a_paterno AS customer_paterno, c.a_materno AS customer_materno, l.lote AS land_lote, l.manzana AS land_manzana, l.predial AS land_predial, l.id_interno AS land_id_interno FROM  sale s JOIN  abonos a ON s.id = a.id_sale JOIN  customers c ON s.id_customer = c.id JOIN  land l ON s.id_land = l.id WHERE  s.id = ? ORDER BY  a.fecha_abono DESC LIMIT 1;',  [id_venta]);
    try{
    // Inicializa el documento PDF
    const doc = new PDFDocument();
    const buffers = [];

    const imgWidth = 100;
    const imgHeight = 80; 
    const imgX = doc.page.width - imgWidth - 30;
    const imgY = 10; 
    doc.image('./public/img/logo.png', imgX, imgY, { width: imgWidth, height: imgHeight });

      // Obtenemos la fecha en formato de objeto Date
    const fechaAbono = new Date(informacion[0].ultima_fecha_abono);

    const fechaFormateada = formatFechaEnLetras(fechaAbono);
    
    const tipo = `CARTA FINIQUITO`;
      doc.text(tipo, {
          align: 'left' 
      });
      doc.moveDown();
   
      const fecha = `Acapulco, Guerrero, a   ${fechaFormateada}`;
      doc.text(fecha, {
          align: 'right' 
      });
      doc.moveDown();
      doc.moveDown();
    
        const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';
        doc.text(`Israel Nogueda Pineda, ${lorem}`, {
                align: 'justify'
            });

        doc.moveDown();
        doc.moveDown();

        const finiquito = `Por este conducto manifiesto, a nombre de mi representada, que  C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} ha cumplido a plena satisfacción de mi representada con los pagos convenidos en el contrato privado de compra venta establecido entre las partes respecto al inmueble con clave  ${informacion[0].land_id_interno}, manzana  ${informacion[0].land_manzana} lote  ${informacion[0].land_lote}, ubicado en el Fraccionamiento Fuerza Área Mexicana, municipio de Acapulco de Juárez, Estado de Guerrero.   `;

        doc.text(finiquito, {align: 'justify'});
        doc.moveDown();
    
        const texto = `De conformidad con la claúsula QUINTA Y SEXTA del Contrato, en cuestión, Basilisk Inmobiliaira Siete S de RL de CV, ratifica, la obligatoriedad de firmar la escritura pública ante la fe del Notario Público que haya sido elegido por C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno}, obligándose a entregar la documentación necesaria para la celebración de la misma, quedando a cargo de C. ${informacion[0].customer_name}  ${informacion[0].customer_paterno} ${informacion[0].customer_materno} los honorarios, gastos, impuestos y derechos que genere la escritura pública, así como también todos los gastos e impuestos anteriores y posteriores por concepto de predial con cuenta catastral   ${informacion[0].land_predial} y derechos por servicios de agua, luz o cualquier otro servicio que se tenga que cubrir por lote materia de compraventa, para llevar a cabo la escrituración respectiva.   `;

        doc.text(texto, {align: 'justify'});

        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        
        doc.moveDown();
        const extra = `Basilisk Inmobiliaria Siete, S. de R.L de C.V `;
        doc.text(extra, {align: 'justify'});

        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
         
        doc.moveDown();
        doc.moveDown();
        const firma  = `Israel Nogueda Pineda  `;
        doc.text(firma, {align: 'justify'});

        const apoderado  = `Apoderado.  `;
        doc.text(apoderado, {align: 'justify'});
            
        doc.moveDown();
        doc.moveDown();
        
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
         
        const nombrelogo  = `B A S I L I S K  `;
        doc.text(nombrelogo, {align: 'center'});
        const footerY = doc.page.height - 20;
    
    
        const lineY = footerY - 30; 
        // Ajusta la posición vertical de la línea
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
                'Content-Disposition': 'attachment; filename=finalizacion.pdf',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        
        });

        // Finaliza y cierra el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        return res.status(500).render('pdferror');
        
    }

}



export const methods = {

    crearPdf,
    contado,
    proceso,
    disponibles,
    pagados,    
    finiquito,
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