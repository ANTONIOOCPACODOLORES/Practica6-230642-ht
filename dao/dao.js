import Session from '../models/Session.js';

// Crear una nueva sesión
const createSession = async (sessionData) => {
    try {
        return await new Session(sessionData).save();
    } catch (error) {
        console.error("Error al crear la sesión:", error);
        throw error;
    }
};

// Buscar sesión por ID
const findSessionById = async (sessionID) => {
    try {
        return await Session.findOne({ sessionID }).exec();
    } catch (error) {
        console.error("Error al buscar la sesión:", error);
        throw error;
    }
};

// Actualizar la sesión (cambia el lastAccess y opcionalmente el status)
const updateSession = async (sessionID, status = null) => {
    try {
        const updateFields = { lastAccess: new Date() };
        if (status) updateFields.status = status; // Permite cambiar el estado de la sesión

        return await Session.findOneAndUpdate(
            { sessionID },
            updateFields,
            { new: true }
        ).exec();
    } catch (error) {
        console.error("Error al actualizar la sesión:", error);
        throw error;
    }
};

// Eliminar una sesión por ID
const deleteSession = async (sessionID) => {
    try {
        return await Session.findOneAndDelete({ sessionID }).exec();
    } catch (error) {
        console.error("Error al eliminar la sesión:", error);
        throw error;
    }
};

// Obtener todas las sesiones
const getAllSessions = async () => {
    try {
        return await Session.find().exec();
    } catch (error) {
        console.error("Error al obtener todas las sesiones:", error);
        throw error;
    }
};

// Obtener solo las sesiones activas
const getActiveSessions = async () => {
    try {
        return await Session.find({ status: "Activa" }).exec();
    } catch (error) {
        console.error("Error al obtener sesiones activas:", error);
        throw error;
    }
};

// Eliminar todas las sesiones (⚠️ Peligroso)
const deleteAllSessions = async () => {
    try {
        return await Session.deleteMany({}).exec();
    } catch (error) {
        console.error("Error al eliminar todas las sesiones:", error);
        throw error;
    }
};

export {
    createSession,
    findSessionById,
    updateSession,
    deleteSession,
    getAllSessions,
    getActiveSessions,
    deleteAllSessions
};
