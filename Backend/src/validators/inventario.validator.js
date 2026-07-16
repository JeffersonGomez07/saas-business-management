export const validarProducto=(producto)=>{

    if(!producto.nombre){
        throw new Error("Nombre requerido");
    }

    if(producto.precio <= 0){
        throw new Error("Precio inválido");
    }

    if(producto.stock < 0){
        throw new Error("Stock inválido");
    }

};