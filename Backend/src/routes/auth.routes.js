import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validarLogin, validarRegistro } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/login", validarLogin, login);

router.post("/register", validarRegistro, register);

export default router;