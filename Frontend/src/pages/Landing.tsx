import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router";
import { 
  BarChart3, 
  Package, 
  Users, 
  FileText, 
  TrendingUp, 
  Shield,
  Zap
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Intuitivo",
      description: "Visualiza tus métricas de negocio en tiempo real"
    },
    {
      icon: Package,
      title: "Gestión de Inventario",
      description: "Control total de tu stock y productos"
    },
    {
      icon: Users,
      title: "Clientes",
      description: "Administra tu cartera de clientes eficientemente"
    },
    {
      icon: FileText,
      title: "Reportes Detallados",
      description: "Análisis profundo de tus operaciones"
    },
    {
      icon: TrendingUp,
      title: "Ventas",
      description: "Gestiona y rastrea todas tus transacciones"
    },
    {
      icon: Shield,
      title: "Seguro y Confiable",
      description: "Tus datos protegidos con la mejor tecnología"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">JGManager</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </Button>
            <Button onClick={() => navigate("/login")}>
              Comenzar Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Gestiona tu Negocio de Forma
          <span className="text-blue-600"> Profesional</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Sistema integral de gestión para pequeños negocios. 
          Todo lo que necesitas en un solo lugar.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/login")}>
            Comenzar Ahora
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Características Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          ¿Listo para transformar tu negocio?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Únete a miles de negocios que confían en BizManager
        </p>
        <Button size="lg" onClick={() => navigate("/login")}>
          Comenzar Gratis
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>&copy; 2026 JGManager. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
