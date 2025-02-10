import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import macaddress from 'macaddress';
import { 
    createSession, 
    findSessionById, 
    updateSession, 
    deleteSession, 
    getAllSessions, 
    getActiveSessions,
    deleteAllSessions
} from '../dao/sessionDao.js';

// Obtener la IP del servidor
const getLocalIp = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null; 
};

// Obtener la dirección MAC del cliente
const getClientMac = async () => {
    try {
        return await macaddress.one(); 
    } catch (error) {
        console.error("Error obteniendo la dirección MAC:", error);
        return "MAC_NO_DISPONIBLE";
    }
};

// Ruta de bienvenida
export const welcome = (req, res) => {
    res.status(200).json({
        message: 'Bienvenid@ a la API de Control de Sesiones',
        author: 'Antonio Ocpaco Dolores'
    });
};

// Iniciar sesión
export const login = async (req, res) => {
    try {
        const { email, nickname, macAddress } = req.body;
        if (!email || !nickname || !macAddress) {
            return res.status(400).json({ message: 'Se esperan campos requeridos' });
        }

        const sessionID = uuidv4();
        const now = new Date();
        const clientMac = await getClientMac();

        const sessionData = {
            sessionID,
            email,
            nickname,
            macAddress: clientMac,  
            ip: getLocalIp(),
            createdAt: now,
            lastAccessed: now,
            status: "Activa"
        };

        await createSession(sessionData);
        res.status(201).json({ message: 'Sesión iniciada', sessionID });

    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// Cerrar sesión
export const logout = async (req, res) => {
    try {
        const { sessionID } = req.body;
        if (!sessionID) {
            return res.status(400).json({ message: 'Se requiere sessionID' });
        }

        const session = await deleteSession(sessionID);
        if (!session) {
            return res.status(404).json({ message: 'No existe una sesión activa' });
        }

        res.status(200).json({ message: 'Logout exitoso' });

    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
    }
};

// Actualizar última actividad
export const updateSessionController = async (req, res) => {
    try {
        const { sessionID, status } = req.body;
        if (!sessionID) {
            return res.status(400).json({ message: 'Se requiere sessionID' });
        }

        const session = await updateSession(sessionID, status);
        if (!session) {
            return res.status(404).json({ message: 'No existe una sesión activa' });
        }

        res.status(200).json({ message: 'Datos actualizados', session });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar sesión', error: error.message });
    }
};

// Obtener el estado de una sesión
export const sessionStatus = async (req, res) => {
    try {
        const sessionID = req.query.sessionID;
        if (!sessionID) {
            return res.status(400).json({ message: 'Se requiere sessionID' });
        }

        const session = await findSessionById(sessionID);
        if (!session) {
            return res.status(404).json({ message: 'No existe una sesión activa' });
        }

        const now = new Date();
        const idleTime = (now - session.lastAccessed) / 1000;
        const duration = (now - session.createdAt) / 1000;

        res.status(200).json({
            message: 'Sesión activa',
            session,
            idleTime: `${idleTime} segundos`,
            duration: `${duration} segundos`
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estado', error: error.message });
    }
};

// Obtener todas las sesiones activas
export const activeSessions = async (req, res) => {
    try {
        const sessions = await getActiveSessions();
        res.status(200).json({ message: 'Sesiones activas', sessions });

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sesiones', error: error.message });
    }
};

// Obtener todas las sesiones (independientemente de su estado)
export const allSessions = async (req, res) => {
    try {
        const sessions = await getAllSessions();
        res.status(200).json({ message: 'Todas las sesiones', sessions });

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sesiones', error: error.message });
    }
};

// Eliminar todas las sesiones (⚠️ Peligroso)
export const deleteAllSessionsController = async (req, res) => {
    try {
        await deleteAllSessions();
        res.status(200).json({ message: 'Todas las sesiones han sido eliminadas' });

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar todas las sesiones', error: error.message });
    }
};
