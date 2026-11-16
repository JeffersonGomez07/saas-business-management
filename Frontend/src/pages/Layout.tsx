import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Zap
} from "lucide-react";
import api from "../service/api";


type Usuario = {
  id: number;
  name: string;
  email: string;
  fotoPerfil: string | null;
};

export default function Layout() {

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [notifications, setNotifications] = useState(0);

  // Obtener usuario
  useEffect(() => {

    const obtenerUsuario = async () => {

      try {

        const res = await api.get("/api/profile/me");
        setUsuario(res.data);

      } catch(error){

        console.error(error);

      }

    };
    obtenerUsuario();
  }, []);

  // Obtener cantidad de notificaciones
  useEffect(() => {
    const obtenerCantidadNotificaciones = async()=>{
      try{
        const res = await api.get("/api/notificaciones/count/me");
        setNotifications(res.data.total);
      }catch(error){
        console.error(error);
      }
    };
    obtenerCantidadNotificaciones();
  }, []);

  const menuItems = [
    { path: "/app", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/app/ventas", icon: ShoppingCart, label: "Ventas" },
    { path: "/app/inventario", icon: Package, label: "Inventario" },
    { path: "/app/clientes", icon: Users, label: "Clientes" },
    { path: "/app/reportes", icon: FileText, label: "Reportes" },
    { path: "/app/configuracion", icon: Settings, label: "Configuración" },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const isActive = (path:string)=>{
    if(path === "/app"){
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };
  return (

    <div className="min-h-screen bg-slate-50">
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r overflow-hidden transition-all duration-300 z-40 ${
        sidebarOpen ? "w-64" : "w-0 -translate-x-full"
      }`}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">
              JGManager
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item)=>(
            <button
              key={item.path}
              onClick={()=>navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive(item.path)
                ?"bg-blue-600 text-white"
                :"text-slate-700 hover:bg-slate-100"
              }`}
            >
              <item.icon className="w-5 h-5"/>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3"/>
            Cerrar Sesión
          </Button>
        </div>
      </aside>
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64":"ml-0"
        }`}
      >
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={()=>setSidebarOpen(!sidebarOpen)}
            >
              {
                sidebarOpen
                ?
                <X/>
                :
                <Menu/>
              }
            </Button>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={()=>navigate("/app/notificaciones")}
              >
                <Bell className="w-5 h-5"/>
                {
                  notifications > 0 &&
                  <Badge
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                }
              </Button>
              <div className="flex items-center gap-3">
              <Avatar>
                  <AvatarImage
                    src={`http://localhost:4000${usuario?.fotoPerfil}`}
                    alt={usuario?.name}
                  />
                <AvatarFallback>
                  {usuario?.name
                    ? usuario.name.substring(0, 2).toUpperCase()
                    : "US"}
                </AvatarFallback>
              </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold">
                    {
                      usuario?.name ?? "Cargando..."
                    }
                  </p>
                  <p className="text-xs text-slate-600">
                    {
                      usuario?.email ?? ""
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}