import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search, AlertTriangle, Edit, Trash2 } from "lucide-react";

type InventarioProducto = {
  totalProductos : number;
  valorInventario : number;
  productosBajoStock : number;
};
type listadoProducto = {
  Id: string;
  Producto: string;
  SKU: string;
  Categoria: string;
  Stock: number;
  Precio: number;
  Proveedor: string ;
  Estado: string;
  MinStock: number;
};
type Categoria = {
  id: number;
  nombre: string;
};

type Proveedor = {
  Id:number;
  Nombre:string;
};

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [inventarioTotal, setInventarioTotal] = useState<InventarioProducto | null>(null);
 useEffect(() => {
    const obtenerInventarioTotal = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/inventario");

        if (!res.ok) {
          throw new Error("Error al obtener el inventario total");
        }

        const data = await res.json();
        console.log(data);

        setInventarioTotal(data);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerInventarioTotal();
   }, []);

  const [listadoProductos, setListadoProductos] = useState<listadoProducto[]>([]);
  useEffect(() => {
    const obtenerListadoProductos = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/listado-productos");

        if (!res.ok) {
          throw new Error("Error al obtener el listado de productos");
        }

        const data = await res.json();
        console.log(data);

        setListadoProductos(data);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerListadoProductos();
  }, []);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/categorias");

        if (!res.ok) {
          throw new Error("Error al obtener las categorías");
        }

        const data = await res.json();
        console.log(data);

        setCategorias(data);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerCategorias();
  }, []);

  const [productoEditar, setProductoEditar] = useState<listadoProducto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    sku: "",
    categoria: "",
    proveedor: "",
    precio: "",
    stock: "",
    minStock: ""
  });
  const editarProducto = (producto: listadoProducto) => {
    setProductoEditar(producto);

    setFormData({
      nombre: producto.Producto,
      sku: producto.SKU,
      categoria: producto.Categoria,
      proveedor: producto.Proveedor,
      precio: producto.Precio.toString(),
      stock: producto.Stock.toString(),
      minStock: producto.MinStock.toString()
    });

    setDialogOpen(true);
  };

  useEffect(() => {

  const obtenerProveedores = async()=>{

    try{

      const res = await fetch(
        "http://localhost:4000/api/proveedores"
      );

      const data = await res.json();

      setProveedores(data);

    }catch(error){

      console.error(error);

    }

  };


  obtenerProveedores();

},[]);


  const eliminarProducto = async (Id: string) => {

  if (!window.confirm("¿Desea eliminar este producto?")) return;

  try {

    const res = await fetch(
      `http://localhost:4000/api/productos/${Id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error("No se pudo eliminar");
    }

    setListadoProductos((productos) =>
      productos.filter((p) => p.Id !== Id)
    );

  } catch (error) {
    console.error(error);
  }
};

const agregarProducto = async () => {
  try {
    const res = await fetch(
      "http://localhost:4000/api/productos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          sku: formData.sku,
          categoria: formData.categoria,
          proveedor: Number(formData.proveedor),
          precio: Number(formData.precio),
          stock: Number(formData.stock),
          minStock: Number(formData.minStock),
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Error al agregar producto");
    }

    const data = await res.json();

    console.log(data);

    setDialogOpen(false);

  } catch (error) {
    console.error(error);
  }
};

const actualizarProducto = async () => {
  if (!productoEditar) return;

  try {
    const res = await fetch(
      `http://localhost:4000/api/productos/${productoEditar.Id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          sku: formData.sku,
          categoria: formData.categoria,
          proveedor: formData.proveedor,
          precio: Number(formData.precio),
          stock: Number(formData.stock),
          minStock: Number(formData.minStock),
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Error al actualizar el producto");
    }

    await res.json();

    await cargarProductos();

    setDialogOpen(false);
    setProductoEditar(null);

    setFormData({
      nombre: "",
      sku: "",
      categoria: "",
      proveedor: "",
      precio: "",
      stock: "",
      minStock: "",
    });

  } catch (error) {
    console.error(error);
  }
};
const cargarProductos = async () => {
  try {
    const res = await fetch(
      "http://localhost:4000/api/listado-productos"
    );

    const data = await res.json();

    setListadoProductos(data);

  } catch(error){
    console.error(error);
  }
};

  const filteredProductos = listadoProductos.filter((producto) => {
  const nombre = producto.Producto?.toLowerCase() || "";const sku = producto.SKU?.toLowerCase() || "";const categoria = producto.Categoria || "";
  const busqueda = searchTerm.toLowerCase();
  const matchesSearch =
  nombre.includes(busqueda) || sku.includes(busqueda);
  const matchesCategory =
  categoryFilter === "todos" || categoria === categoryFilter;
  return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Agotado", color: "bg-red-100 text-red-700" };
    if (stock < minStock)
      return { label: "Bajo Stock", color: "bg-yellow-100 text-yellow-700" };
    return { label: "En Stock", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-600 mt-1">Gestiona tus productos y stock</p>
        </div>
        <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);

              if (!open) {
                setProductoEditar(null);
              }
            }}
          >
          <DialogTrigger asChild>
            <Button
              onClick={()=>{
                setProductoEditar(null);

                setFormData({
                  nombre:"",
                  sku:"",
                  categoria:"",
                  proveedor:"",
                  precio:"",
                  stock:"",
                  minStock:""
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2"/>
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {productoEditar ? "Editar Producto" : "Agregar Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Producto</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e)=>
                        setFormData({
                            ...formData,
                            nombre:e.target.value
                        })
                    }
                />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                    <Input
                        value={formData.sku}
                        onChange={(e)=>
                            setFormData({
                                ...formData,
                                sku:e.target.value
                            })
                        }
                    />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        categoria: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>

                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem
                          key={categoria.id}
                          value={categoria.nombre}
                        >
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                </div>
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor"/>
                    </SelectTrigger>

                    <SelectContent>
                      {proveedores.map((proveedor)=>(
                        <SelectItem 
                          key={proveedor.Id}
                          value={proveedor.Id.toString()}
                        >
                          {proveedor.Nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Precio</Label>
                <Input
                    type="number"
                    value={formData.precio}
                    onChange={(e)=>
                        setFormData({
                            ...formData,
                            precio:e.target.value
                        })
                    }
                />
                </div>
                <div className="space-y-2">
                  <Label>Stock Inicial</Label>
                    <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e)=>
                            setFormData({
                                ...formData,
                                stock:e.target.value
                            })
                        }
                    />
                </div>
                <div className="space-y-2">
                  <Label>Stock Mínimo</Label>
                    <Input
                      type="number"
                      value={formData.minStock}
                      onChange={(e)=>
                          setFormData({
                              ...formData,
                              minStock:e.target.value
                          })
                      }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={()=>{
                      setDialogOpen(false);

                      setProductoEditar(null);

                      setFormData({
                          nombre:"",
                          sku:"",
                          categoria:"",
                          proveedor:"",
                          precio:"",
                          stock:"",
                          minStock:""
                      });
                  }}
              >
                  Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (productoEditar) {
                    actualizarProducto();
                  } else {
                    agregarProducto();
                  }
                }}
              >
                {productoEditar ? "Actualizar producto" : "Agregar producto"}
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
            <p className="text-sm text-slate-600">Total Productos</p>
            <p className="text-2xl font-bold mt-1">{inventarioTotal?.totalProductos ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Valor de Inventario</p>
            <p className="text-2xl font-bold mt-1">
              ₡{(inventarioTotal?.valorInventario ?? 0).toLocaleString("es-CR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Productos Bajo Stock</p>
              <p className="text-2xl font-bold mt-1">{inventarioTotal?.productosBajoStock ?? 0}</p>
            </div>
            {(inventarioTotal?.productosBajoStock ?? 0) > 0 && (
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  Todas las categorías
                </SelectItem>

                {categorias.map((categoria) => (
                  <SelectItem
                    key={categoria.id}
                    value={categoria.nombre}
                  >
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductos.map((obtenerListadoProductos) => {
                  const status = getStockStatus(obtenerListadoProductos.Stock, obtenerListadoProductos.MinStock);
                  return (
                    <TableRow key={obtenerListadoProductos.Id}>
                      <TableCell className="font-medium">
                        {obtenerListadoProductos.Producto}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {obtenerListadoProductos.SKU}
                      </TableCell>
                      <TableCell>{obtenerListadoProductos.Categoria}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{obtenerListadoProductos.Stock}</span>
                          {obtenerListadoProductos.Stock < obtenerListadoProductos.MinStock && (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${obtenerListadoProductos.Precio.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {obtenerListadoProductos.Proveedor}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editarProducto(obtenerListadoProductos)}
                          >
                              <Edit className="w-4 h-4"/>
                          </Button>
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarProducto(obtenerListadoProductos.Id)}
                          >
                              <Trash2 className="w-4 h-4 text-red-600"/>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
