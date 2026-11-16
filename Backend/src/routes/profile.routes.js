import { Router} from "express";
import { obtenerPerfil, actualizarPerfil, actualizarFoto, cambiarContrasena, obtenerPreferencias, actualizarPreferencias, obtenerApariencia, actualizarApariencia} from "../controllers/profile.controller.js";
import upload from "../config/multer.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyToken);

router.get("/me", obtenerPerfil);
router.put("/me", actualizarPerfil);
router.put("/me/photo", upload.single("foto"), actualizarFoto);
router.put("/me/password", cambiarContrasena);
router.get("/me/preferences", obtenerPreferencias);
router.put("/me/preferences", actualizarPreferencias);
router.get("/me/appearance", obtenerApariencia);
router.put("/me/appearance", actualizarApariencia);

export default router;