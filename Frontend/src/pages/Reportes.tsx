import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../components/ui/select";
import {LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { Download, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type reporteTotal = {
  Ingresos : number;
  Costos : number;
  Ganancia : number;
  MargenGanancia : number;
}; 
type VentaMensual = {
  mes: string;
  ventas: number;
  gastos: number;
  ganancia: number;
};

type VentaCategoria = {
  categoria: string;
  ventas: number;
};

type TopProducto = {
  producto: string;
  ventas: number;
  ingresos: number;
};

export default function Reportes() {
  const [reporte, setReporte] = useState<reporteTotal | null>(null);
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState<VentaCategoria[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
  const [filtro, setFiltro] = useState("30dias");

  const obtenerRangoFechas = useCallback(() => {
  const hoy = new Date();
  const desde = new Date();

  switch (filtro) {
    case "7dias":
      desde.setDate(hoy.getDate() - 7);
      break;

    case "30dias":
      desde.setDate(hoy.getDate() - 30);
      break;

    case "3meses":
      desde.setMonth(hoy.getMonth() - 3);
      break;

    case "6meses":
      desde.setMonth(hoy.getMonth() - 6);
      break;

    case "1anio":
      desde.setFullYear(hoy.getFullYear() - 1);
      break;

    default:
      desde.setDate(hoy.getDate() - 30);
  }

  return {
    desde: desde.toISOString().split("T")[0],
    hasta: hoy.toISOString().split("T")[0],
  };
}, [filtro]);

  useEffect(() => {

  const cargarReportes = async () => {
    try {

    const { desde, hasta } = obtenerRangoFechas();

    const reporteResponse = await fetch(
      `http://localhost:4000/api/reportes/reportes?desde=${desde}&hasta=${hasta}`
    );

    const financiero = await fetch(
      `http://localhost:4000/api/reportes/analisis-financiero?desde=${desde}&hasta=${hasta}`
    );

    const categorias = await fetch(
      `http://localhost:4000/api/reportes/ventas-por-categoria?desde=${desde}&hasta=${hasta}`
    );

    const productos = await fetch(
      `http://localhost:4000/api/reportes/top-productos?desde=${desde}&hasta=${hasta}`
    );

    const reporteData = await reporteResponse.json();
    const financieroData = await financiero.json();
    const categoriasData = await categorias.json();
    const productosData = await productos.json();
    

    setReporte(reporteData);
    setVentasMensuales(financieroData);
    setVentasPorCategoria(categoriasData);
    setTopProductos(Array.isArray(productosData) ? productosData : [productosData]);

    } catch(error){
      console.error(
        "Error cargando reportes:",
        error
      );
    }
  };


  cargarReportes();

},[filtro, obtenerRangoFechas]);

const exportarPDF = () => {

  const { desde, hasta } = obtenerRangoFechas();

  window.open(
    `http://localhost:4000/api/reportes/pdf?desde=${desde}&hasta=${hasta}`,
    "_blank"
  );

};


  const metricasClave = [
  {
    titulo: "Ingresos Totales",
    valor: `₡${reporte?.Ingresos.toLocaleString("es-CR") ?? 0}`,
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    titulo: "Costos",
    valor: `₡${reporte?.Costos.toLocaleString("es-CR") ?? 0}`,
    icon: DollarSign,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    titulo: "Ganancia",
    valor: `₡${reporte?.Ganancia.toLocaleString("es-CR") ?? 0}`,
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    titulo: "Margen de Ganancia",
    valor: `${reporte?.MargenGanancia ?? 0}%`,
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
          <p className="text-slate-600 mt-1">
            Análisis detallado de tu negocio
          </p>
        </div>
        <div className="flex gap-3">
          <Select
              value={filtro}
              onValueChange={setFiltro}
            >
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7dias">Últimos 7 días</SelectItem>
              <SelectItem value="30dias">Últimos 30 días</SelectItem>
              <SelectItem value="3meses">Últimos 3 meses</SelectItem>
              <SelectItem value="6meses">Últimos 6 meses</SelectItem>
              <SelectItem value="1anio">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            onClick={exportarPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricasClave.map((metrica) => (
          <Card key={metrica.titulo}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{metrica.titulo}</p>
                  <p className="text-2xl font-bold mt-1">{metrica.valor}</p>
                </div>
                <div className={`p-3 rounded-lg ${metrica.bgColor}`}>
                  <metrica.icon className={`w-6 h-6 ${metrica.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ventas vs Gastos vs Ganancias */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={ventasMensuales}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorVentas)"
                name="Ventas"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorGastos)"
                name="Gastos"
              />
              <Area
                type="monotone"
                dataKey="ganancia"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorGanancia)"
                name="Ganancia"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ventas por Categoría y Top Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductos.map((producto, index) => (
                <div
                  key={producto.producto}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{producto.producto}</p>
                      <p className="text-sm text-slate-600">
                        {producto.ventas} unidades vendidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₡{producto.ingresos.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia de Crecimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Crecimiento Mensual</CardTitle>
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
                dataKey="ganancia"
                stroke="#10b981"
                strokeWidth={3}
                name="Ganancia Neta"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
