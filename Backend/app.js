import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
const app = express(); // Crear instancia de Express

app.use(cors());
app.use(express.json()); // Middleware para parsear JSON en las solicitudes


// Importar rutas
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import ventasRoutes from "./src/routes/ventas.routes.js";
import inventarioRoutes from "./src/routes/inventario.routes.js";
import clientesRoutes from "./src/routes/clientes.routes.js";
import reportesRoutes from "./src/routes/reportes.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import notificacionesRoutes from "./src/routes/notificaciones.routes.js"

// Registrar las rutas de usuario
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
// Registrar las rutas del dashboard
app.use("/api/dashboard", dashboardRoutes);
// Registrar las rutas de ventas
app.use("/api", ventasRoutes);
// Registrar las rutas de inventario
app.use("/api", inventarioRoutes);
// Registrar las rutas de clientes
app.use("/api", clientesRoutes);
// Registrar las rutas de reportes
app.use("/api/reportes", reportesRoutes);
// Registrar las rutas de profiles
app.use("/api/profile", profileRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/notificaciones", notificacionesRoutes)


app.listen(4000, () => {
    console.log("Servidor escuchando en el puerto 4000");
});
export default app;