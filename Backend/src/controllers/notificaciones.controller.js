import * as notificacionesService from "../services/notificaciones.service.js";

export const obtenerNotificaciones = async (req,res)=>{

    try{

        const userId = req.user.id;

        const data = await notificacionesService.obtenerNotificaciones(userId, req.user.companyId);

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
      req.user.id,
      req.user.companyId
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
      req.user.id,
      req.user.companyId
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
      { ...req.body, userId: req.user.id, companyId: req.user.companyId }
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
      req.params.id,
      req.user.id,
      req.user.companyId
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
      req.user.id,
      req.user.companyId
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
      req.params.id,
      req.user.id,
      req.user.companyId
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
      req.user.id,
      req.user.companyId
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
      req.user.id,
      req.user.companyId
    );

    res.json(cantidad);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje:"Error interno del servidor"
    });

  }
};