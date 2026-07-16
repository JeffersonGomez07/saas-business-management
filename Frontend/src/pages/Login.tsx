import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router";
import { Zap, Mail, Lock } from "lucide-react";
import api from "../service/api";
import { toast } from "sonner";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const res = await api.post("/api/auth/login", {
      email: form.email,
      password: form.password
    });

    console.log(res.data);

    toast.success("Login exitoso");

    // guardar sesión 
    localStorage.setItem("token", res.data.token);


    navigate("/app");

  } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error al iniciar sesión"
        );
      } else {
        toast.error("Error desconocido");
      }
    }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-slate-900">JGManager</span>
          </div>
          <p className="text-slate-600 text-center">
            Inicia sesión para acceder a tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
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

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                  }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-600">Recordarme</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/recuperar-password")}
              className="text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/registro")}
              className="text-blue-600 hover:underline font-semibold"
            >
              Regístrate gratis
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-slate-600"
          >
            ← Volver al inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default Login;