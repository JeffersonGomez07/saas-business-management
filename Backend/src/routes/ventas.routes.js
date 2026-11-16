import { Router } from "express";
import { ventas, listadoVentas, registrarVenta, obtenerClientes, obtenerProductos } from "../controllers/ventas.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyToken);

router.get("/ventas", ventas);
router.get("/listado-ventas", listadoVentas);
router.post("/ventas", registrarVenta);

router.get("/clientesVenta", obtenerClientes);

router.get("/productosVenta", obtenerProductos);

export default router;