import {Router} from 'express';
import { obtenerReportes, analisisFinanciero, ventasPorCategoria, topProductosVendidos, exportarPDF } from '../controllers/reportes.controller.js';

const router = Router();

router.get('/reportes', obtenerReportes);
router.get('/analisis-financiero', analisisFinanciero);
router.get('/ventas-por-categoria', ventasPorCategoria);
router.get('/top-productos', topProductosVendidos)
router.get("/pdf", exportarPDF);

export default router;