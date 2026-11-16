import * as profileService from "../services/profile.service.js"

export const obtenerPerfil = async(req,res)=>{

try{

const id = req.user.id;

const perfil = await profileService.obtenerPerfil(id);


if(!perfil){
 return res.status(404).json({
    message:"Usuario no encontrado"
 });
}


res.json(perfil);


}catch(error){

console.error(error);

res.status(500).json({
 message:"Error al obtener perfil"
});

}

}

export const actualizarPerfil = async (req, res) => {
  try {

    const id = req.user.id;
    const datos = req.body;
    
    if (!datos) {
      return res.status(400).json({
        message: "No se recibieron datos."
      });
    }

    const filasAfectadas = await profileService.actualizarPerfil(id, datos);

    console.log("Filas afectadas:", filasAfectadas);

    if (filasAfectadas === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado o no se realizaron cambios."
      });
    }

    const perfilActualizado = await profileService.obtenerPerfil(id);

    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      data: perfilActualizado
    });

  } catch (error) {

    console.error("Error al actualizar perfil:", error);

    return res.status(500).json({
      message: "Error al actualizar el perfil",
      error: error.message
    });

  }
};
export const actualizarFoto = async (req, res) => {
  try {

    const id = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        message: "No se recibió ninguna imagen."
      });
    }

    const ruta = `/uploads/profiles/${req.file.filename}`;

    const filasAfectadas = await profileService.actualizarFoto(id, ruta);

    if (filasAfectadas === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado."
      });
    }

    res.status(200).json({
      message: "Foto actualizada correctamente",
      fotoPerfil: ruta
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error al actualizar la foto de perfil"
    });

  }
};

export const cambiarContrasena = async (req, res) => {
  try{
    const { passwordActual, passwordNueva } = req.body;
    const result = await profileService.cambiarContrasena(req.user.id, passwordActual, passwordNueva);
    if (result === null) return res.status(404).json({ message: "Usuario no encontrado" });
    if (!result) return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    res.json({ message: "Contraseña actualizada correctamente" });

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al cambiar la contrasena"
    });
  }
}

export const obtenerPreferencias = async (req, res) => {
  try{
    const obtenerPreferenciasResult = await profileService.obtenerPreferencias(req.user.id);
    res.json(obtenerPreferenciasResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener las preferencias"
    });
  }
}

export const actualizarPreferencias = async (req, res) => {
  try{
    const actualizarPreferenciasResult = await profileService.actualizarPreferencias(req.user.id, req.body);
    res.json(actualizarPreferenciasResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al actualizar preferencias"
    });
  }
}

export const obtenerApariencia = async (req, res) => {
  try{
    const obtenerAparienciaResult = await profileService.obtenerApariencia(req.user.id);
    res.json(obtenerAparienciaResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al obtener la apariencia"
    });
  }
}

export const actualizarApariencia = async (req, res) => {
  try{
    const actualizarAparienciaResult = await profileService.actualizarApariencia(req.user.id, req.body);
    res.json(actualizarAparienciaResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al actualizar apariencia"
    });
  }
}
