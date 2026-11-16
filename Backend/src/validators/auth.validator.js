export const validarLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email requerido"
        });
    }

    if (!password) {
        return res.status(400).json({
            message: "Password requerido"
        });
    }

    next();
};

export const validarRegistro = (req, res, next) => {

    const { name, company_name, email, password } = req.body;


    if (!name || !company_name || !email || !password) {
        return res.status(400).json({
            message: "Nombre, empresa, email y contraseña son obligatorios"
        });
    }


    if (password.length < 6) {
        return res.status(400).json({
            message: "La contraseña debe tener mínimo 6 caracteres"
        });
    }


    next();
};