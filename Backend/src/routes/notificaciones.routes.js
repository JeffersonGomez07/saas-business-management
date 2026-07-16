import { Router } from "express";

import { obtenerNotificaciones, obtenerNoLeidas, obtenerResumen, crearNotificacion, marcarComoLeida, marcarTodasComoLeidas, eliminarNotificacion, limpiarNotificaciones, obtenerCantidadNoLeidas} from "../controllers/notificaciones.controller.js";

const router = Router();


router.get("/:userId/unread", obtenerNoLeidas);

router.get("/:userId/resumen", obtenerResumen);

router.get("/count/:id", obtenerCantidadNoLeidas);

router.patch("/:userId/read-all", marcarTodasComoLeidas);

router.patch("/:id/read", marcarComoLeida);

router.delete("/user/:userId", limpiarNotificaciones);

router.delete("/:id", eliminarNotificacion);

router.get("/:userId", obtenerNotificaciones);

router.post("/", crearNotificacion);



export default router;