import * as clienteService from "../services/clientes.service.js";


export const obtenerClientes = async (req,res)=>{

    try{

        const clientes = await clienteService.obtenerClientes(req.user.companyId);

        res.json(clientes);

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Error del servidor"
        });

    }

};


export const listadoClientes = async (req,res)=>{

    try{

        const clientes = await clienteService.listadoClientes(req.user.companyId);

        res.json({
            clientes
        });

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Error del servidor"
        });

    }

};



export const crearCliente = async(req,res)=>{

    try{

        const cliente = await clienteService.crearCliente(req.body, req.user.companyId);


        res.status(201).json({
            success:true,
            message:"Cliente creado correctamente",
            cliente
        });


    }catch(error){

        console.error(error);


        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};