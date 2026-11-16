import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useNavigate } from "react-router";
import { Zap, Mail, Lock, User, Building, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "../service/api.ts";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company_name: "",
    password: "",
    confirmPassword: "",
    aceptaTerminos: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

  if (!form.aceptaTerminos) {
    toast.error("Debes aceptar los términos y condiciones");
    return;
  }

  if (form.password !== form.confirmPassword) {
    toast.error("Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await api.post("/api/auth/register", {
      name: form.name,
      company_name: form.company_name,
      email: form.email,
      password: form.password
    });

    console.log(res.data);

    toast.success("¡Registro exitoso!");

    setTimeout(() => {
      navigate("/login");
    }, 1500);

  } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";

      console.error(message);
      toast.error("Error al registrar usuario");
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-slate-900">JGManager</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de tu Empresa *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="empresa"
                  type="text"
                  placeholder="Mi Negocio S.A."
                  value={form.company_name}
                  onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Checkbox
              id="terminos"
              checked={form.aceptaTerminos}
              onCheckedChange={(checked) =>
                setForm({ ...form, aceptaTerminos: checked as boolean })
              }
              className="mt-1"
            />
            <label htmlFor="terminos" className="text-sm text-slate-700 cursor-pointer">
              Acepto los{" "}
              <a href="#" className="text-blue-600 hover:underline">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="#" className="text-blue-600 hover:underline">
                política de privacidad
              </a>{" "}
              de JGManager
            </label>
          </div>

          <Button type="submit" className="w-full">
            Crear mi Cuenta Gratis
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-semibold"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button
            onClick={() => navigate("/")}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default Register;