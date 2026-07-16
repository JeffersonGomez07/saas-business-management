import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ShoppingCart, Users, AlertTriangle, CheckCircle, Info, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
export type NotificacionApi = {
  Id: number;
  Titulo: string;
  Mensaje: string;
  Categoria: "Ventas" | "Inventario" | "Clientes" | "Sistema";
  Prioridad: "Baja" | "Normal" | "Alta" | "Critica";
  Leida: boolean;
  Fecha: string;
  FechaLectura: string | null;
};

export type Notificacion = NotificacionApi & {
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

export default function Notificaciones() {

const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
const [loading, setLoading] = useState(true);

 const userId = 1;

  const adaptarNotificaciones = (
    data: NotificacionApi[]
  ): Notificacion[] => {

    return data.map((n) => ({

      ...n,

      icon:
        n.Categoria === "Ventas"
          ? ShoppingCart
          : n.Categoria === "Inventario"
          ? AlertTriangle
          : n.Categoria === "Clientes"
          ? Users
          : Info,

      color:
        n.Categoria === "Ventas"
          ? "text-green-600"
          : n.Categoria === "Inventario"
          ? "text-yellow-600"
          : n.Categoria === "Clientes"
          ? "text-purple-600"
          : "text-blue-600",

      bgColor:
        n.Categoria === "Ventas"
          ? "bg-green-100"
          : n.Categoria === "Inventario"
          ? "bg-yellow-100"
          : n.Categoria === "Clientes"
          ? "bg-purple-100"
          : "bg-blue-100",

    }));
  };

const obtenerNotificaciones = useCallback(async () => {

  try {

    const response = await axios.get<NotificacionApi[]>(
      `http://localhost:4000/api/notificaciones/${userId}`
    );

    const adaptadas =
      adaptarNotificaciones(response.data);

    setNotificaciones(adaptadas);

  } catch (error) {

    console.error(
      "Error cargando notificaciones:",
      error
    );

  } finally {

    setLoading(false);
  }

}, [userId]);

  useEffect(() => {
    obtenerNotificaciones();
  }, [obtenerNotificaciones]);

  const marcarTodasLeidas = async () => {

    try {

      await axios.patch(
        `http://localhost:4000/api/notificaciones/${userId}/read-all`
      );


      setNotificaciones((prev) =>
        prev.map((n) => ({
          ...n,
          Leida: true,
          FechaLectura: new Date().toISOString()
        }))
      );


    } catch(error){

      console.error(
        "Error marcando notificaciones:",
        error
      );

    }

  };

  const limpiarTodas = async () => {

    try {

      await axios.delete(
        `http://localhost:4000/api/notificaciones/user/${userId}`
      );


      setNotificaciones([]);


    } catch(error){

      console.error(
        "Error eliminando notificaciones:",
        error
      );

    }

  };

  const eliminarNotificacion = async (
    id:number
  ) => {

    try {

      await axios.delete(
        `http://localhost:4000/api/notificaciones/${id}`
      );


      setNotificaciones((prev)=>
        prev.filter(
          (n)=>n.Id !== id
        )
      );


    } catch(error){

      console.error(
        "Error eliminando:",
        error
      );

    }

  };

  if(loading){

    return (
      <div className="p-6">
        Cargando notificaciones...
      </div>
    );
  }

  const noLeidas =
    notificaciones.filter(
      (n)=>!n.Leida
    );

 const NotificationCard = ({ notif, }: { notif: Notificacion; }) => (
    <div
      className={`p-4 rounded-lg border ${
        !notif.Leida ? "bg-blue-50 border-blue-200" : "bg-white"
      }`}
    >
      <div className="flex gap-4">
        <div className={`p-2 rounded-lg ${notif.bgColor} h-fit`}>
          <notif.icon className={`w-5 h-5 ${notif.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold">{notif.Titulo}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => eliminarNotificacion(notif.Id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-600 mb-2">{notif.Mensaje}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{new Date(notif.Fecha).toLocaleString()}</span>
            {!notif.Leida && (
              <Badge className="bg-blue-600 text-white">Nueva</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notificaciones</h1>
          <p className="text-slate-600 mt-1">
            {noLeidas.length} notificaciones sin leer
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={marcarTodasLeidas}
          >

            Marcar todas como leídas

          </Button>
          <Button
            variant="outline"
            onClick={limpiarTodas}
          >
            Limpiar todas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">No Leídas</p>
                <p className="text-2xl font-bold">{noLeidas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ventas</p>
                <p className="text-2xl font-bold">
                  {notificaciones.filter((n) => n.Categoria === "Ventas").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Alertas</p>
                <p className="text-2xl font-bold">
                  {notificaciones.filter((n) => n.Categoria === "Inventario").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Clientes</p>
                <p className="text-2xl font-bold">
                  {notificaciones.filter((n) => n.Categoria === "Clientes").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas">
            <TabsList>
              <TabsTrigger value="todas">
                Todas ({notificaciones.length})
              </TabsTrigger>
              <TabsTrigger value="no-leidas">
                No Leídas ({noLeidas.length})
              </TabsTrigger>
              <TabsTrigger value="ventas">Ventas</TabsTrigger>
              <TabsTrigger value="inventario">Inventario</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="space-y-3 mt-6">
              {notificaciones.map((notif) => (
                <NotificationCard key={notif.Id} notif={notif} />
              ))}
            </TabsContent>

            <TabsContent value="no-leidas" className="space-y-3 mt-6">
              {noLeidas.length > 0 ? (
                noLeidas.map((notif) => (
                  <NotificationCard key={notif.Id} notif={notif} />
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">¡Todo al día!</p>
                  <p className="text-slate-600">No tienes notificaciones pendientes</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ventas" className="space-y-3 mt-6">
              {notificaciones
                .filter((n) => n.Categoria === "Ventas")
                .map((notif) => (
                  <NotificationCard key={notif.Id} notif={notif} />
                ))}
            </TabsContent>

            <TabsContent value="inventario" className="space-y-3 mt-6">
              {notificaciones
                .filter((n) => n.Categoria === "Inventario")
                .map((notif) => (
                  <NotificationCard key={notif.Id} notif={notif} />
                ))}
            </TabsContent>

            <TabsContent value="clientes" className="space-y-3 mt-6">
              {notificaciones
                .filter((n) => n.Categoria === "Clientes")
                .map((notif) => (
                  <NotificationCard key={notif.Id} notif={notif} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
