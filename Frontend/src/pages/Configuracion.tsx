import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { User, Mail, Phone, Building, MapPin, Lock, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import api from "../service/api";

type Perfil = {
  id : number;
  name : string;
  company_name : string;
  email : string;
  telefono : string;
  direccion: string;
  fotoPerfil: string | null;

}

export default function Configuracion() {
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    push: true,
    ventas: true,
    inventario: false,
    clientes: true,
  });
  const [infoPerfil, setInfoPerfil] = useState<Perfil| null>(null);
  useEffect(() => {
      const informacionPerfil = async () => {
      try {
        const res = await api.get("/api/profile/me");
        setInfoPerfil(res.data);
      } catch (error) {
        console.error(error);
      }
    };
      const obtenerPreferencias = async () => {
        try {

          const res = await api.get("/api/profile/me/preferences");
          const data = res.data;

          setNotificaciones({
            email: data.email_notifications,
            push: data.push_notifications,
            ventas: data.ventas_notifications,
            inventario: data.inventario_notifications,
            clientes: data.clientes_notifications,
          });

        } catch (error) {
          console.error(error);
        }
      };
    informacionPerfil();
    obtenerPreferencias();
  }, []);


  const handleSave = async () => {

  if (!infoPerfil) return;

  console.log("Datos enviados:", infoPerfil);

  try {

    const res = await api.put("/api/profile/me", infoPerfil);
    const data = res.data;

    console.log(data);

    setInfoPerfil(data.data);

    toast.success(data.message);

    if (foto) {
    await subirFoto();
}

  } catch (error) {

    console.error(error);
    toast.error("No se pudo actualizar el perfil");

  }
};

const [foto, setFoto] = useState<File | null>(null);
const [passwordData, setPasswordData] = useState({
  passwordActual: "",
  passwordNueva: "",
  confirmarPassword: ""
});
const [preview, setPreview] = useState("");

const subirFoto = async () => {

    if(!foto) return;

    console.log("Subiendo foto:", foto);

    const formData = new FormData();

    formData.append("foto", foto);

    await api.put("/api/profile/me/photo", formData);
};

const cambiarPassword = async()=>{

  if(passwordData.passwordNueva !== passwordData.confirmarPassword){

    toast.error("Las contraseñas no coinciden");
    return;

  }
  try{
    await api.put("/api/profile/me/password", passwordData);
    toast.success("Contraseña actualizada");

    setPasswordData({
      passwordActual:"",
      passwordNueva:"",
      confirmarPassword:""
    });

  }catch(error){
  console.error(error);
}
}
const guardarPreferencias = async () => {

  try {

    await api.put("/api/profile/me/preferences", notificaciones);

    toast.success("Preferencias guardadas");

  } catch (error) {

    console.error(error);

    toast.error("Error al guardar preferencias");

  }
};


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600 mt-1">
          Administra tu perfil y preferencias del sistema
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="usuario">
            <Lock className="w-4 h-4 mr-2" />
            Usuario
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* Perfil Tab */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id="fotoPerfil"
                  onChange={(e) => {
                  if (!e.target.files) return;
                  const archivo = e.target.files[0];
                  setFoto(archivo);
                  setPreview(URL.createObjectURL(archivo));
              }}
              />
                  <Avatar className="w-24 h-24">

                      <AvatarImage
                          src={
                              preview
                                  ? preview
                                  : infoPerfil?.fotoPerfil
                                      ? `http://localhost:4000${infoPerfil.fotoPerfil}`
                                      : ""
                          }
                      />

                      <AvatarFallback className="text-2xl">
                          {infoPerfil?.name?.charAt(0)}
                      </AvatarFallback>

                  </Avatar>
                <div className="space-y-2">
                <Button
                    variant="outline"
                    onClick={() =>
                        document.getElementById("fotoPerfil")?.click()
                    }
                >
                    Cambiar Foto
                </Button>
                  <p className="text-sm text-slate-600">
                    JPG, PNG o GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={infoPerfil?.name || ""}
                      onChange={(e) =>
                        setInfoPerfil({
                          ...infoPerfil!,
                          name: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      value={infoPerfil?.email || ""}
                      onChange={(e) =>
                        setInfoPerfil({
                          ...infoPerfil!,
                          email: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={infoPerfil?.telefono || ""}
                      onChange={(e) =>
                        setInfoPerfil({
                          ...infoPerfil!,
                          telefono: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={infoPerfil?.company_name || ""}
                      onChange={(e) =>
                        setInfoPerfil({
                          ...infoPerfil!,
                          company_name: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={infoPerfil?.direccion || ""}
                      onChange={(e) =>
                        setInfoPerfil({
                          ...infoPerfil!,
                          direccion: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuario Tab */}
        <TabsContent value="usuario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Contraseña Actual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Contraseña actual"
                    className="pl-10"
                    value={passwordData.passwordActual}
                    onChange={(e)=>setPasswordData({
                        ...passwordData,
                        passwordActual:e.target.value
                    })}
                  />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Nueva contraseña"
                    className="pl-10"
                    value={passwordData.passwordNueva}
                    onChange={(e)=>setPasswordData({
                        ...passwordData,
                        passwordNueva:e.target.value
                    })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Confirmar contraseña"
                      className="pl-10"
                      value={passwordData.confirmarPassword}
                      onChange={(e)=>setPasswordData({
                          ...passwordData,
                          confirmarPassword:e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button onClick={cambiarPassword}>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

         
        </TabsContent>

        {/* Notificaciones Tab */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Canales de Notificación</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Notificaciones por Email</p>
                      <p className="text-sm text-slate-600">
                        Recibe actualizaciones en tu correo
                      </p>
                    </div>
                    <Switch
                      checked={notificaciones.email}
                      onCheckedChange={(checked) =>
                        setNotificaciones({ ...notificaciones, email: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Notificaciones Push</p>
                      <p className="text-sm text-slate-600">
                        Recibe alertas en tiempo real
                      </p>
                    </div>
                    <Switch
                      checked={notificaciones.push}
                      onCheckedChange={(checked) =>
                        setNotificaciones({ ...notificaciones, push: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Tipos de Notificaciones</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Nuevas Ventas</p>
                      <p className="text-sm text-slate-600">
                        Cuando se registra una nueva venta
                      </p>
                    </div>
                    <Switch
                      checked={notificaciones.ventas}
                      onCheckedChange={(checked) =>
                        setNotificaciones({ ...notificaciones, ventas: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Alertas de Inventario</p>
                      <p className="text-sm text-slate-600">
                        Cuando un producto tiene bajo stock
                      </p>
                    </div>
                    <Switch
                      checked={notificaciones.inventario}
                      onCheckedChange={(checked) =>
                        setNotificaciones({
                          ...notificaciones,
                          inventario: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Nuevos Clientes</p>
                      <p className="text-sm text-slate-600">
                        Cuando se registra un nuevo cliente
                      </p>
                    </div>
                    <Switch
                      checked={notificaciones.clientes}
                      onCheckedChange={(checked) =>
                        setNotificaciones({ ...notificaciones, clientes: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={guardarPreferencias}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apariencia Tab */}
        <TabsContent value="apariencia" className="space-y-6">
        </TabsContent>
      </Tabs>
    </div>
  );
}
