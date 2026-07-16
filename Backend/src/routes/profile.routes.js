import { Router} from "express";
import { obtenerPerfil, actualizarPerfil, actualizarFoto, cambiarContrasena, obtenerPreferencias, actualizarPreferencias, obtenerApariencia, actualizarApariencia} from "../controllers/profile.controller.js";
import upload from "../config/multer.js";

const router = Router();


router.get("/:id", obtenerPerfil);

router.put("/:id", actualizarPerfil);

router.put("/foto/:id", upload.single("foto"), actualizarFoto);

router.put("/password/:id", cambiarContrasena);

router.get("/notificaciones/:id", obtenerPreferencias);

router.put("/notificaciones/:id", actualizarPreferencias);

router.get("/apariencia/:id", obtenerApariencia);

router.put("/apariencia/:id", actualizarApariencia);

export default router;