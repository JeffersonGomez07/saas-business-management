import routes from "express";
import { obtenerInventario, listadoProductos, obtenerCategorias, eliminarProducto, actualizarProducto, agregarProducto, obtenerProveedores } from "../controllers/Inventario.controller.js";


const router = routes.Router();

router.get("/inventario", obtenerInventario);
router.get("/categorias", obtenerCategorias);
router.get("/listado-productos", listadoProductos);
router.delete("/productos/:id", eliminarProducto);
router.put("/productos/:id", actualizarProducto);
router.post("/productos", agregarProducto);
router.get("/proveedores", obtenerProveedores);

export default router;