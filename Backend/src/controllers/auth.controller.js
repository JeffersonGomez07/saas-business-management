import * as authService from "../services/auth.service.js";

export const login = async (req, res) => {
    try {

        const usuario = await authService.login(req.body);

        res.json(usuario);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};

export const register = async (req, res) => {
    try {

        const usuario = await authService.register(req.body);

        res.status(201).json({
            message: "Usuario registrado correctamente",
            usuario
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};