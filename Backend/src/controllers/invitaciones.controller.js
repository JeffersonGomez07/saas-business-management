import { crearInvitacion } from "../services/invitaciones.service.js";

export const emitirInvitacion = async (req, res) => {
    try {
        const invitation = await crearInvitacion({
            email: req.body.email,
            userId: req.user.id,
            companyId: req.user.companyId
        });
        return res.status(201).json(invitation);
    } catch (error) {
        if (!error.statusCode || error.statusCode >= 500) {
            console.error("Error al crear invitación:", error);
        }
        return res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : "No se pudo crear la invitación"
        });
    }
};
