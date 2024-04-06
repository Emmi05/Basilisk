import PDFDocument from "pdfkit";
import fs from 'fs';
import { pool } from '../database/db.js';

export async function buildPDF(dataCallback, endCallback) {
    const doc = new PDFDocument();

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    try {
      const id_venta = req.params.id;
      const [abonosrows] = await pool.query('SELECT s.id,s.ncuotas_pagadas, s.cuotas, s.n_cuentas, s.deuda_restante, a.fecha_abono, a.cuotas_pagadas, a.cuotas_restantes, c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno FROM sale s JOIN abonos a ON s.id = a.id_sale JOIN customers c ON s.id_customer = c.id WHERE s.id = ? ORDER BY a.fecha_abono DESC LIMIT 1;', [id_venta]);

      const [resultados] = await pool.query('SELECT *FROM sale');


        const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';
        const dinamica = 'Recibo de la C. $vendedor';

        doc.fontSize(12);

        resultados.forEach((fila) => {
            doc.text(`: ${fila.id_customer}`);
            doc.text(''); // Salto de línea
        });

        doc.moveDown();
        doc.text(`Israel Nogueda Pineda, ${lorem}`, {
            width: 410,
            align: 'justify'
        });

        doc.end();
    } catch (error) {
        console.error('Error en la consulta:', error);
    }
}
