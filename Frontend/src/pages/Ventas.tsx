import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search, Filter, Eye, Download } from "lucide-react";
import { apiFetch } from "../service/api";

type Cliente = {
  Id: number;
  Nombre: string;
};

type Producto = {
  Id: number;
  Nombre: string;
  Precio: number;
  Stock: number;
};

type totalVentas = {
  totalVentas: number;
  transacciones: number;
  completadas: number;
};

type listadoVenta = {
  Id : number;
  Codigo : string;
  Fecha : string;
  Cliente : string;
  Producto : string;
  Total : number;
  MetodoPago : string;
  Estado : string;
};


export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [ventasTotal, setVentas] = useState<totalVentas | null>(null); 

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [clienteId, setClienteId] = useState("");

  const [metodoPago, setMetodoPago] = useState("");

  const [productosVenta, setProductosVenta] = useState([
    {
      productoId: "",
      cantidad: 1,
    },
  ]);

  const [ventaSeleccionada, setVentaSeleccionada] = useState<listadoVenta | null>(null);
  const [openVenta, setOpenVenta] = useState(false);
const registrarVenta = async () => {

  if (!clienteId) {
    alert("Seleccione un cliente");
    return;
  }

  if (!metodoPago) {
    alert("Seleccione un método de pago");
    return;
  }

  if (productosVenta.length === 0) {
    alert("Debe agregar un producto");
    return;
  }

  const response = await apiFetch(
    "http://localhost:4000/api/ventas",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        clienteId: Number(clienteId),
        metodoPago,
        productos: productosVenta,
      }),
    }
  );

  const data = await response.json();

  console.log(data);
};

const agregarProducto = () => {
  setProductosVenta([
    ...productosVenta,
    {
      productoId: "",
      cantidad: 1,
    },
  ]);
};

const actualizarProducto = (
  index: number,
  campo: "productoId" | "cantidad",
  valor: string
) => {
  const copia = [...productosVenta];

  copia[index] = {
    ...copia[index],
    [campo]:
      campo === "cantidad"
        ? Number(valor)
        : valor,
  };

  setProductosVenta(copia);
};

const eliminarProducto = (index: number) => {
  setProductosVenta(
    productosVenta.filter((_, i) => i !== index)
  );
};
useEffect(() => {
  apiFetch("http://localhost:4000/api/clientesVenta")
    .then((r) => r.json())
    .then((data) => {
      console.log(data);
      setClientes(data);
    });

  apiFetch("http://localhost:4000/api/productosVenta")
    .then((r) => r.json())
    .then((data) => {
      console.log(data);
      setProductos(data);
    });
}, []);

  useEffect(() => {
    apiFetch("http://localhost:4000/api/ventas")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setVentas(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const [listadoVentas, setListadoVentas] = useState<listadoVenta[]>([]); 
  useEffect(() => {
    apiFetch("http://localhost:4000/api/listado-ventas")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setListadoVentas(data);
      })
      .catch((err) => console.error(err));
  }, []);

const filteredVentas = listadoVentas.filter((venta) => {
  const busqueda = searchTerm.toLowerCase().trim();

  const matchesSearch =
    venta.Id.toString().includes(busqueda) ||
    venta.Cliente.toLowerCase().includes(busqueda);

  const matchesStatus =
    statusFilter === "todos" ||
    venta.Estado.toLowerCase() === statusFilter.toLowerCase();

  return matchesSearch && matchesStatus;
});

    console.log("Buscando:", searchTerm);
    console.log("Resultado:", filteredVentas);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-700";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "Procesando":
        return "bg-blue-100 text-blue-700";
      case "Cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

 const verVenta = (venta: listadoVenta) => {
    setVentaSeleccionada(venta);
  };

  const exportarVentas = () => {
  const encabezados = [
    "Codigo",
    "Fecha",
    "Cliente",
    "Producto",
    "Total",
    "MetodoPago",
    "Estado"
  ];

  const filas = filteredVentas.map((venta) => [
    venta.Codigo,
    venta.Fecha,
    venta.Cliente,
    venta.Producto,
    venta.Total,
    venta.MetodoPago,
    venta.Estado
  ]);

  const contenido = [
    encabezados,
    ...filas
  ]
    .map((fila) => fila.join(","))
    .join("\n");


  const blob = new Blob(
    [contenido],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "ventas.csv";

  link.click();

  URL.revokeObjectURL(url);
};

  const totalVentas = listadoVentas.reduce(
    (sum, venta) => sum + venta.Total,
    0
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-600 mt-1">Gestiona todas las transacciones</p>
        </div>
        <Dialog open={openVenta} onOpenChange={setOpenVenta}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                      value={clienteId}
                      onValueChange={setClienteId}
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem
                          key={cliente.Id}
                          value={cliente.Id.toString()}
                        >
                          {cliente.Nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <Select
                      value={metodoPago}
                      onValueChange={setMetodoPago}
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
             <div className="space-y-4">

              <Label>Productos</Label>

              {productosVenta.map((producto, index) => (

                <div
                  key={index}
                  className="grid grid-cols-3 gap-2"
                >

                  <Select
                    value={producto.productoId}
                    onValueChange={(value)=>
                      actualizarProducto(
                        index,
                        "productoId",
                        value
                      )
                    }
                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Producto"/>

                    </SelectTrigger>

                    <SelectContent>

                      {productos.map((p)=>(

                        <SelectItem
                          key={p.Id}
                          value={p.Id.toString()}
                        >
                          {p.Nombre}
                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                  <Input
                    type="number"
                    min={1}
                    value={producto.cantidad}
                    onChange={(e)=>
                      actualizarProducto(
                        index,
                        "cantidad",
                        e.target.value
                      )
                    }
                  />

                  <Button
                    variant="destructive"
                    onClick={()=>
                      eliminarProducto(index)
                    }
                  >
                    Eliminar
                  </Button>
                  <div className="flex justify-end gap-2 pt-4 w-full translate-x-19">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenVenta(false);
                      setClienteId("");
                      setMetodoPago("");
                      setProductosVenta([
                        {
                          productoId: "",
                          cantidad: 1,
                        },
                      ]);
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button onClick={registrarVenta}>
                    Registrar Venta
                  </Button>
                </div>

                </div>

              ))}

              <Button
                variant="outline"
                onClick={agregarProducto}
              >
                <Plus className="w-4 h-4 mr-2"/>
                Agregar Producto
              </Button>

            </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Total Ventas</p>
            <p className="text-2xl font-bold mt-1">
              ₡{totalVentas.toLocaleString("es-MX")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Transacciones</p>
            <p className="text-2xl font-bold mt-1">{ventasTotal?.transacciones}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Completadas</p>
            <p className="text-2xl font-bold mt-1">{ventasTotal?.completadas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="procesando">Procesando</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
              <Button 
                variant="outline"
                onClick={exportarVentas}
              >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVentas.map((listadoVentas) => (
                  <TableRow key={`${listadoVentas.Id}-${listadoVentas.Producto}`}>
                    <TableCell>
                      {new Date(listadoVentas.Fecha).toLocaleDateString("es-CR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{listadoVentas.Cliente}</TableCell>
                    <TableCell>{listadoVentas.Producto}</TableCell>
                    <TableCell className="font-semibold">
                      ₡{listadoVentas.Total.toLocaleString("es-MX")}
                    </TableCell>
                    <TableCell>{listadoVentas.MetodoPago}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(listadoVentas.Estado)}>
                        {listadoVentas.Estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => verVenta(listadoVentas)}
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
      <Dialog 
          open={ventaSeleccionada !== null}
          onOpenChange={() => setVentaSeleccionada(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Detalle de Venta
              </DialogTitle>
            </DialogHeader>

            {ventaSeleccionada && (
              <div className="space-y-3">

                <p>
                  <strong>Código:</strong> {ventaSeleccionada.Codigo}
                </p>

                <p>
                  <strong>Fecha:</strong> {ventaSeleccionada.Fecha}
                </p>

                <p>
                  <strong>Cliente:</strong> {ventaSeleccionada.Cliente}
                </p>

                <p>
                  <strong>Producto:</strong> {ventaSeleccionada.Producto}
                </p>

                <p>
                  <strong>Total:</strong> ₡
                  {ventaSeleccionada.Total.toLocaleString("es-MX")}
                </p>

                <p>
                  <strong>Método:</strong> {ventaSeleccionada.MetodoPago}
                </p>

                <p>
                  <strong>Estado:</strong> {ventaSeleccionada.Estado}
                </p>

              </div>
            )}

          </DialogContent>
        </Dialog>
    </div>
  );
}


