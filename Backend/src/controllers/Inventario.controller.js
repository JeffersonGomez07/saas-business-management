import * as inventarioService from "../services/inventario.service.js"


export const obtenerInventario = async (req, res) => {
  try{
    const obtenerInventarioResult = await inventarioService.obtenerInventario();
    res.json(obtenerInventarioResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener inventario"
    });
  }
}

export const listadoProductos = async (req, res) => {
  try{
    const listadoProductosResult = await inventarioService.listadoProductos();
    res.json(listadoProductosResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener listado de productos"
    });
  }
}

export const obtenerCategorias = async (req, res) => {
  try{
    const obtenerCategoriasResult = await inventarioService.obtenerCategorias();
    res.json(obtenerCategoriasResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener las categorias"
    });
  }
}

export const eliminarProducto = async (req, res) => {
  try{
    const eliminarProductoResult = await inventarioService.eliminarProducto();
    res.json(eliminarProductoResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al eliminar producto"
    });
  }
}

export const actualizarProducto = async (req, res) => {
  try{
    const actualizarProductoResult = await inventarioService.actualizarProducto();
    res.json(actualizarProductoResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al actualizar producto"
    });
  }
}

export const agregarProducto = async (req, res) => {
  try{
    const agregarProductoResult = await inventarioService.agregarProducto();
    res.json(agregarProductoResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al agregar producto"
    });
  }
}

export const obtenerProveedores = async (req, res) => {
  try{
    const obtenerProveedoresResult = await inventarioService.obtenerProveedores();
    res.json(obtenerProveedoresResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener proveedores"
    });
  }
}
