import * as ventasService from "../services/ventas.service.js"

export const ventas = async (req, res) => {
  try{
    const ventasResult = await ventasService.ventas();
    res.json(ventasResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"error al iniciar sesion"
    });
  }
}

export const listadoVentas = async (req, res) => {
  try{
    const listadoVentasResult = await ventasService.listadoVentas();
    res.json(listadoVentasResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"error al iniciar sesion"
    });
  }
}

export const registrarVenta = async (req, res) => {
  try{
    const registraVentaResult = await ventasService.registrarVenta();
    res.json(registraVentaResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"error al iniciar sesion"
    });
  }
}

export const obtenerClientes = async (req, res) => {
  try{
    const clientes = await ventasService.obtenerClientes();
    res.json(clientes);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"error al iniciar sesion"
    });
  }
}

export const obtenerProductos = async (req, res) => {
  try{
    const obtenerProductosResult = await ventasService.obtenerProductos();
    res.json(obtenerProductosResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"error al iniciar sesion"
    });
  }
}
