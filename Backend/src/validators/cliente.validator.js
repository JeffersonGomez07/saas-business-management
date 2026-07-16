export const validarCliente = (cliente)=>{

    if(!cliente.nombre || cliente.nombre.trim()===""){
        throw new Error("El nombre es obligatorio");
    }

    if(cliente.correo && !cliente.correo.includes("@")){
        throw new Error("Correo inválido");
    }

};