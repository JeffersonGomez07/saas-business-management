import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router";
import { Zap, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      // Simulación de envío de email
      setEmailEnviado(true);
      toast.success("Correo enviado exitosamente");
    }
  };

  if (emailEnviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              ¡Correo Enviado!
            </h2>
            
            <p className="text-slate-600 mb-6">
              Hemos enviado las instrucciones para restablecer tu contraseña a{" "}
              <span className="font-semibold text-slate-900">{email}</span>
            </p>

            <div className="w-full space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-left">
                <p className="font-semibold text-blue-900 mb-2">
                  Próximos pasos:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>Haz clic en el enlace de recuperación</li>
                  <li>Crea una nueva contraseña segura</li>
                </ol>
              </div>

              <p className="text-sm text-slate-600">
                ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
                <button
                  onClick={() => setEmailEnviado(false)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  intenta de nuevo
                </button>
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-slate-900">BizManager</span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          
          <p className="text-slate-600 text-center">
            No te preocupes, te enviaremos instrucciones para restablecerla
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-sm text-slate-600">
              Ingresa el correo asociado a tu cuenta
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Enviar Instrucciones
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            ¿Recordaste tu contraseña?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-semibold"
            >
              Inicia sesión
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 text-center">
            <strong>Nota de seguridad:</strong> Por tu protección, el enlace de
            recuperación expirará en 1 hora
          </p>
        </div>
      </Card>
    </div>
  );
}
