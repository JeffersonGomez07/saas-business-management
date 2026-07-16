import { Router } from "express";
import { obtenerResumen, obtenerVentasMensuales, obtenerVentasCategorias, obtenerDistribucionProductos, obtenerVentasRecientes } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/resumen", obtenerResumen);
router.get("/ventas-mensuales", obtenerVentasMensuales);
router.get("/ventas-categorias", obtenerVentasCategorias);
router.get("/distribucion-productos", obtenerDistribucionProductos);
router.get("/ventas-recientes", obtenerVentasRecientes);

export default router;