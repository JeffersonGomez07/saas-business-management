export const validarVenta=(venta)=>{

    if(!venta.clienteId){
        throw new Error("Cliente requerido");
    }

    if(!venta.productos || venta.productos.length===0){
        throw new Error("Debe agregar productos");
    }

};