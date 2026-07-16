import { createBrowserRouter } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Registro";
import PrivateRoute from "./PrivateRoutes";

import Layout from "../pages/Layout";
import Dashboard from "../pages/Dashboard";
import Ventas from "../pages/Ventas";
import Inventario from "../pages/Inventario";
import Clientes from "../pages/Clientes";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/Configuracion";
import Notificaciones from "../pages/Notificaciones";

export const router = createBrowserRouter([
  
  {
    path: "/",
    element: <Landing />,
  },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registro",
    element: <Register />,
  },
  {
    path: "/",
    element: <Ventas />,
  },
  //  APP PROTEGIDA
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/app",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "ventas",
            element: <Ventas />,
          },
          {
            path: "inventario",
            element: <Inventario />,
          },
          {
            path: "clientes",
            element: <Clientes />,
          },
          {
            path: "reportes",
            element: <Reportes />,
          },
          {
            path: "configuracion",
            element: <Configuracion />,
          },
          {
            path: "notificaciones",
            element: <Notificaciones />,
          },
        ],
      },
    ],
  },
]);