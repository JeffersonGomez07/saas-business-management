import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { obtenerUsuario } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const user = await pool.request()
    .input("id", userId)
    .query("SELECT id, name, email FROM users WHERE id = @id");

  res.json(user.recordset[0]);
});

router.get("/:id", (req, res, next) => {
  if (Number(req.params.id) !== Number(req.user.id)) {
    return res.status(403).json({ message: "No autorizado" });
  }
  return obtenerUsuario(req, res, next);
});

export default router;