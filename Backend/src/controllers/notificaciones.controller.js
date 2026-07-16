import * as notificacionesService from "../services/notificaciones.service.js";

export const obtenerNotificaciones = async (req,res)=>{

    try{

        const {userId}=req.params;

        const data = await notificacionesService.obtenerNotificaciones(userId);

        res.json(data);

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Error al obtener notificaciones"
        });

    }
};


export const obtenerNoLeidas = async (req, res) => {
  try {
    const notificaciones = await notificacionesService.obtenerNoLeidas(
      req.params.userId
    );

    res.json(notificaciones);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};


export const obtenerResumen = async (req, res) => {
  try {
    const resumen = await notificacionesService.obtenerResumen(
      req.params.userId
    );

    res.json(resumen);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};


export const crearNotificacion = async (req, res) => {
  try {

    const notificacion = await notificacionesService.crearNotificacion(
      req.body
    );

    res.status(201).json(notificacion);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al crear notificacion"
    });
  }
};


export const marcarComoLeida = async (req, res) => {
  try {

    const resultado = await notificacionesService.marcarComoLeida(
      req.params.id
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};


export const marcarTodasComoLeidas = async (req, res) => {
  try {

    const resultado = await notificacionesService.marcarTodasComoLeidas(
      req.params.userId
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};


export const eliminarNotificacion = async (req, res) => {
  try {

    const resultado = await notificacionesService.eliminarNotificacion(
      req.params.id
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar notificacion"
    });
  }
};


export const limpiarNotificaciones = async (req, res) => {
  try {

    const resultado = await notificacionesService.limpiarNotificaciones(
      req.params.userId
    );

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error al limpiar notificaciones"
    });
  }
};


export const obtenerCantidadNoLeidas = async (req, res) => {
  try {

    const cantidad = await notificacionesService.obtenerCantidadNoLeidas(
      req.params.userId
    );

    res.json(cantidad);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje:"Error interno del servidor"
    });

  }
};