import * as userService from "../services/user.service.js"

export const obtenerUsuario = async (req, res) => {
  try{
    const obtenerUsuarioResult = await userService.obtenerUsuario();
    res.json(obtenerUsuarioResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener las notificaciones"
    });
  }
}