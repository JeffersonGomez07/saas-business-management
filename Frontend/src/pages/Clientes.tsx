import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Plus, Search, Mail, Phone, MapPin, Eye } from "lucide-react";

type ClienteResumen = {
  totalClientes: number;
  ingresosTotales: number;
  promedioPorCliente: number;
};
type listadoCliente = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  ubicacion: string;
  totalCompras: number;
  numCompras: number;
  ultimaCompra: string;
};

type NuevoCliente = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
};

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");

const [clientesResumen, setClientesResumen] = useState<ClienteResumen | null>(null);
const [listadoClientes, setListadoClientes] = useState<listadoCliente[]>([]);
const [nuevoCliente, setNuevoCliente] = useState<NuevoCliente>({
  nombre: "",
  correo: "",
  telefono: "",
  direccion: "",
});
const [clienteSeleccionado, setClienteSeleccionado] = useState<listadoCliente | null>(null);
const [openDetalle, setOpenDetalle] = useState(false);
const agregarCliente = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/clientes/crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoCliente),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Cliente agregado correctamente");

    // Limpiar formulario
    setNuevoCliente({
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
    });

    // Volver a cargar la lista
    const listadoRes = await fetch("http://localhost:4000/api/clientes/listado");
    const listado = await listadoRes.json();

    const resumenRes = await fetch("http://localhost:4000/api/clientes");
    const resumen = await resumenRes.json();

    setListadoClientes(listado.clientes);
    setClientesResumen(resumen);

  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  const cargarDatos = async () => {
    try {
      const [resumenRes, listadoRes] = await Promise.all([
        fetch("http://localhost:4000/api/clientes"),
        fetch("http://localhost:4000/api/clientes/listado"),
      ]);

      const resumen = await resumenRes.json();
      const listado = await listadoRes.json();

      console.log(listado);
      console.log(Array.isArray(listado));

      setClientesResumen(resumen);
      setListadoClientes(listado.clientes);
    } catch (error) {
      console.error(error);
    }
  };

  cargarDatos();
}, []);


  const filteredClientes = listadoClientes.filter(
    (cliente) =>
      cliente.id.toString().includes(searchTerm) ||
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.totalCompras.toString().includes(searchTerm) ||
      cliente.numCompras.toString().includes(searchTerm) ||
      cliente.ultimaCompra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClientes = clientesResumen?.totalClientes ?? 0;
  const totalIngresos = clientesResumen?.ingresosTotales ?? 0;
  const promedioCompra = clientesResumen?.promedioPorCliente ?? 0;

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1">Administra tu cartera de clientes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    placeholder="Ej: María González"
                    value={nuevoCliente.nombre}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="cliente@email.com"
                    value={nuevoCliente.correo}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        correo: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    placeholder="+52 555-1234"
                    value={nuevoCliente.telefono}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        telefono: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dirección Completa</Label>
                <Input
                  placeholder="Pérez Zeledón"
                  value={nuevoCliente.direccion}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      direccion: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setNuevoCliente({
                      nombre: "",
                      correo: "",
                      telefono: "",
                      direccion: "",
                    })
                  }
                >
                  Cancelar
                </Button>
              <Button onClick={agregarCliente}>
                Agregar Cliente
              </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openDetalle} onOpenChange={setOpenDetalle}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Información del Cliente</DialogTitle>
            </DialogHeader>

            {clienteSeleccionado && (
              <div className="space-y-3">

                <div>
                  <strong>Nombre:</strong> {clienteSeleccionado.nombre}
                </div>

                <div>
                  <strong>Correo:</strong> {clienteSeleccionado.correo}
                </div>

                <div>
                  <strong>Teléfono:</strong> {clienteSeleccionado.telefono}
                </div>

                <div>
                  <strong>Ubicación:</strong> {clienteSeleccionado.ubicacion}
                </div>

                <div>
                  <strong>Total Compras:</strong> ₡
                  {clienteSeleccionado.totalCompras.toLocaleString("es-CR")}
                </div>

                <div>
                  <strong>Número de Compras:</strong>
                  {" "}
                  {clienteSeleccionado.numCompras}
                </div>

                <div>
                  <strong>Última Compra:</strong>
                  {" "}
                  {clienteSeleccionado.ultimaCompra}
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Total Clientes</p>
            <p className="text-2xl font-bold mt-1">{totalClientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Ingresos Totales</p>
            <p className="text-2xl font-bold mt-1">
              ₡{totalIngresos.toLocaleString("es-CR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Promedio por Cliente</p>
            <p className="text-2xl font-bold mt-1">
              ₡{promedioCompra.toLocaleString("es-CR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Total Compras</TableHead>
                  <TableHead># Compras</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((listadoCliente) => (
                  <TableRow key={listadoCliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(listadoCliente.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{listadoCliente.nombre}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">{listadoCliente.correo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">{listadoCliente.telefono}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{listadoCliente.ubicacion}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₡{listadoCliente.totalCompras.toLocaleString("es-CR")}
                    </TableCell>
                    <TableCell>{listadoCliente.numCompras}</TableCell>
                    <TableCell className="text-slate-600">
                      {listadoCliente.ultimaCompra}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setClienteSeleccionado(listadoCliente);
                          setOpenDetalle(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
