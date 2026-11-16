export const validarLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            message: "Email requerido"
        });
    }

    if (typeof password !== "string" || !password) {
        return res.status(400).json({
            message: "Password requerido"
        });
    }

    next();
};

export const validarRegistro = (req, res, next) => {
    const { name, company_name, email, password, inviteCode } = req.body;
    const hasInviteCode = typeof inviteCode === "string" && inviteCode.trim().length > 0;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || !password ||
        (inviteCode !== undefined && typeof inviteCode !== "string") ||
        (typeof inviteCode === "string" && inviteCode.length > 128) ||
        (!hasInviteCode && (typeof company_name !== "string" || !company_name.trim()))
    ) {
        return res.status(400).json({
            message: "Nombre, email, contraseña y empresa o código de invitación son obligatorios"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "La contraseña debe tener mínimo 6 caracteres"
        });
    }

    next();
};