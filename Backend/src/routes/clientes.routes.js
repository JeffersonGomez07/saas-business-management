import { Router } from "express";
import { obtenerClientes, listadoClientes, crearCliente } from "../controllers/clientes.controller.js";

const router = Router();

router.get("/clientes", obtenerClientes);
router.get("/clientes/listado", listadoClientes);
router.post("/clientes/crear", crearCliente);


export default router;