import PDFDocument from "pdfkit";
import * as reportesService from "../services/reportes.service.js";


export const obtenerReportes = async (req, res) => {
  try {

    const { desde, hasta } = req.query;

    const resultado = await reportesService.obtenerReportes(
      desde,
      hasta
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener reportes"
    });

  }
};



export const analisisFinanciero = async (req, res) => {
  try {

    const { desde, hasta } = req.query;

    const resultado = await reportesService.analisisFinanciero(
      desde,
      hasta
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener el analisis financiero"
    });

  }
};




export const ventasPorCategoria = async (req, res) => {
  try {

    const { desde, hasta } = req.query;

    const resultado = await reportesService.ventasPorCategoria(
      desde,
      hasta
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener las ventas por categoria"
    });

  }
};

export const topProductosVendidos = async (req, res) => {
  try {

    const { desde, hasta } = req.query;

    const resultado = await reportesService.topProductosVendidos(
      desde,
      hasta
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener top productos vendidos"
    });

  }
};

export const exportarPDF = async(req,res)=>{

  try {

    const { desde, hasta } = req.query;


    const reporte = await reportesService.obtenerReportes(
      desde,
      hasta
    );


    const doc = new PDFDocument();


    res.setHeader(
      "Content-Type",
      "application/pdf"
    );


    res.setHeader(
      "Content-Disposition",
      "inline; filename=reporte.pdf"
    );


    doc.pipe(res);


    doc.fontSize(20)
    .text("Reporte Financiero");


    doc.moveDown();


    doc.fontSize(14)
    .text(`Periodo: ${desde} - ${hasta}`);


    doc.moveDown();


    doc.text(
      `Ingresos: ₡${reporte.Ingresos.toLocaleString()}`
    );


    doc.text(
      `Costos: ₡${reporte.Costos.toLocaleString()}`
    );


    doc.text(
      `Ganancia: ₡${reporte.Ganancia.toLocaleString()}`
    );


    doc.text(
      `Margen: ${reporte.MargenGanancia}%`
    );


    doc.end();


  } catch(error){

    console.error(error);

    res.status(500).json({
      mensaje:"Error generando PDF"
    });

  }

};