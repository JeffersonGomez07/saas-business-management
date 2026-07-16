import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { obtenerUsuario } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const user = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [userId]
  );

  res.json(user.rows[0]);
});

router.get("/:id", obtenerUsuario);

export default router;