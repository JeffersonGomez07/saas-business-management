import * as profileService from "../services/profile.service.js"

export const obtenerPerfil = async(req,res)=>{

try{

const {id}=req.params;

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
  try{
    const actualizarPerfilResult = await profileService.actualizarPerfil();
    res.json(actualizarPerfilResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al actualizar el perfil"
    });
  }
}

export const actualizarFoto = async (req, res) => {
  try{
    const actualizarFotoResult = await profileService.actualizarFoto();
    res.json(actualizarFotoResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al actualizar la foto de perfil"
    });
  }
}

export const cambiarContrasena = async (req, res) => {
  try{
    const cambiarContrasenaResult = await profileService.cambiarContrasena();
    res.json(cambiarContrasenaResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al cambiar la contrasena"
    });
  }
}

export const obtenerPreferencias = async (req, res) => {
  try{
    const obtenerPreferenciasResult = await profileService.obtenerPreferencias();
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
    const actualizarPreferenciasResult = await profileService.actualizarPreferencias();
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
    const obtenerAparienciaResult = await profileService.obtenerApariencia();
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
    const actualizarAparienciaResult = await profileService.actualizarApariencia();
    res.json(actualizarAparienciaResult);

  }catch(error){
    console.error(error);
    res.status(500).json({
      mensaje:"Error al actualizar apariencia"
    });
  }
}
