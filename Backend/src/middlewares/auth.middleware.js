import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const token = authHeader.slice("Bearer ".length).trim();
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ message: "Autenticación no configurada" });
    }

    if (!token) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.companyId) {
      return res.status(401).json({ message: "Token inválido" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};