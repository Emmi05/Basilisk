import PDFDocument from "pdfkit";

export function buildPDF(dataCallback, endCallback) {
  const doc = new PDFDocument();

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

//   doc.fontSize(25).text("Some title from PDF Kit");
const lorem = ' apoderado de Basilisk Inmobiliaria Siete S de RL de CV, personalidad y facultades que acredito mediante escritura pública número 45,153 de 19 de Febrero de 2015, otorgada ante la fe del licenciado José Luis Altamirano Quintero, Notario Público número 66 del Distro Federal.';

doc.fontSize(12);


doc.moveDown();
doc.text(`Israel Nogueda Pineda, ${lorem}`, {
  width: 410,
  align: 'justify'
})

  doc.end();
}