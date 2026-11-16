import { Router } from "express";
import { emitirInvitacion } from "../controllers/invitaciones.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validarInvitacion } from "../validators/invitaciones.validator.js";

const router = Router();

router.use(verifyToken);
router.post("/", validarInvitacion, emitirInvitacion);

export default router;
