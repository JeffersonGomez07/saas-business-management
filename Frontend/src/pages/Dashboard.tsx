import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

import {LineChart,Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";

import {ShoppingCart, Package, Users, DollarSignIcon, } from "lucide-react";

type ResumenDashboard = {
  totalVentas: number;
  totalPedidos: number;
  totalProductos: number;
  totalClientes: number;
};

type VentaMensual = {
  mes: number;
  totalVentas: number;
};
type VentaPorCategoria = {
  categoria: string;
  totalVentas: number;
};
type DistribucionProducto = {
  producto : string;
  totalVentas: number;
};

type VentaReciente = {
  Id: number;
  Codigo : string;
  Fecha : string;
  Cliente : string;
  Total : number;
  MetodoPago : string;
  Estado : string;
};

export default function Dashboard() {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null); // Estado para almacenar el resumen del dashboard

  useEffect(() => {
    const obtenerResumen = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/dashboard/resumen");

        if (!res.ok) {
          throw new Error("Error al obtener el resumen");
        }

        const data = await res.json();
        console.log(data);

        setResumen(data);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerResumen(); 
    }, []);

  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  useEffect(() => {
    const obtenerVentasMensuales = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/dashboard/ventas-mensuales");

        if (!res.ok) {
          throw new Error("Error al obtener las ventas mensuales");
        }

        const data = await res.json();
        console.log(data);

        setVentasMensuales(data.ventasMensuales);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerVentasMensuales();
   }, []);

  const [ventasCategorias, setVentasCategorias] = useState<VentaPorCategoria[]>([]);
  useEffect (() => {
    const obtenerVentasPorCategoria = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/dashboard/ventas-categorias");

        if (!res.ok) {
          throw new Error("Error al obtener las ventas por categoría");
        }

        const data = await res.json();
        console.log(data);
        setVentasCategorias(data.ventasCategorias);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerVentasPorCategoria();
    }, []);

  const [distribucionProductos, setDistribucionProductos] = useState<DistribucionProducto[]>([]);
  useEffect (() => {
    const obtenerDistribucionProductos = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/dashboard/distribucion-productos");

        if (!res.ok) {
          throw new Error("Error al obtener la distribución de productos");
        }

        const data = await res.json();
        console.log(data);

        setDistribucionProductos(data.distribucionProductos);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerDistribucionProductos();
    }, []); 

  
  const [ventasRecientes, setVentasRecientes] = useState<VentaReciente[]>([]);
  useEffect (() => { 
    const obtenerVentasRecientes = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/dashboard/ventas-recientes");

        if (!res.ok) {
          throw new Error("Error al obtener las ventas recientes");
        }

        const data = await res.json();
        console.log(data);

        setVentasRecientes(data.ventasRecientes);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerVentasRecientes();
    }, []);

    
  const stats = [
    {
      title: "Ventas del Mes",
      value: `₡${resumen?.totalVentas.toLocaleString("es-CR") ?? 0}`,
      icon: DollarSignIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pedidos",
      value: resumen?.totalPedidos ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Productos",
      value: resumen?.totalProductos ?? 0,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Clientes",
      value: resumen?.totalClientes ?? 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Resumen general de tu negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString("es-MX")}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalVentas"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Ventas (₡)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalVentas" fill="#3b82f6" name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribucionProductos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ producto, percent }) =>
                    `${producto} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalVentas"
                >
                  {distribucionProductos.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ventasRecientes.map((venta) => (
                <div
                  key={venta.Id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">Cliente: {venta.Cliente}</p>
                    <p className="text-sm text-slate-600">{venta.Codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₡{venta.Total.toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        venta.Estado === "Completada"
                          ? "bg-green-100 text-green-700"
                          : venta.Estado === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {venta.Estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
