export const validarInvitacion = (req, res, next) => {
    const email = req.body?.email;
    if (
        typeof email !== "string" ||
        email.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({ message: "Indique un correo electrónico válido" });
    }

    next();
};
