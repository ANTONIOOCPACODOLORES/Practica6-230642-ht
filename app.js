import express from 'express';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import macaddress from 'macaddress';
import connectDB from './database.js';  // Conexión a MongoDB
import Session from './models/models.js';  // Modelo de sesiones

const app = express();
const PORT = 3001;

// Conectar a MongoDB antes de iniciar el servidor
connectDB();

// Middleware para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para obtener la IP local del servidor
const getLocalIp = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
};

// Función para obtener la dirección MAC del cliente
const getClientIP = async () => {
    try {
        return await macaddress.one();
    } catch (error) {
        console.error("❌ Error obteniendo la dirección MAC:", error);
        return "00:00:00:00:00:00"; // MAC por defecto si falla
    }
};

// Ruta de bienvenida
app.get('/Welcome', (req, res) => {
    return res.status(200).json({
        message: "Bienvenido al API de control de sesiones",
        autor: "Antonio O. Dolores"
    });
});

// Ruta de login
app.post('/login', async (req, res) => {
    console.log(" Solicitud recibida en /login:", req.body);

    const { email, nickname, macAddress } = req.body;

    if (!email || !nickname || !macAddress) {
        console.log("Error: Faltan campos obligatorios.");
        return res.status(400).json({ message: 'Se esperan campos requeridos' });
    }

    try {
        // Generar un ID único para la sesión
        const sessionID = uuidv4();
        const now = new Date();
        const clientIp = await getClientIP();

        // Crear nueva sesión en la base de datos
        const newSession = new Session({
            sessionID,
            email,
            nickname,
            macAddress,
            ip: clientIp,
            serverIp: getLocalIp(),
            createdAt: now,
            lastAccessed: now,
            status: "active"
        });

        await newSession.save();  // Guardar la sesión en MongoDB

        console.log(" Sesión creada en MongoDB:", newSession);

        res.status(200).json({
            message: 'Se ha logueado de manera exitosa',
            sessionID,
        });
    } catch (error) {
        console.error(" Error guardando la sesión en MongoDB:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta de logout
app.post("/logout", async (req, res) => {
    const { sessionID } = req.body;

    if (!sessionID) {
        return res.status(400).json({ message: 'Se necesita sessionID' });
    }

    try {
        const updatedSession = await Session.findOneAndUpdate(
            { sessionID },
            { 
                status: "inactive",  // Cambiar el estado a inactivo
                lastAccessed: new Date()
            },
            { new: true }  // Devuelve el documento actualizado
        ).exec();

        if (!updatedSession) {
            return res.status(404).json({ message: 'Sesión no encontrada' });
        }

        res.status(200).json({
            message: 'Sesión cerrada correctamente',
            session: updatedSession
        });
    } catch (error) {
        console.error("Error cerrando la sesión:", error);
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
});


// Ruta de actualización de sesión
app.post("/update", async (req, res) => {
    const { sessionID, status } = req.body;

    if (!sessionID || !status) {
        return res.status(400).json({ message: 'Se necesitan sessionID y status' });
    }

    try {
        const updatedSession = await Session.findOneAndUpdate(
            { sessionID },
            { 
                lastAccessed: new Date(),
                status 
            },
            { new: true }  // Devuelve el documento actualizado
        ).exec();

        if (!updatedSession) {
            return res.status(404).json({ message: 'Sesión no encontrada' });
        }

        res.status(200).json({
            message: 'Sesión actualizada',
            session: updatedSession
        });
    } catch (error) {
        console.error(" Error actualizando la sesión:", error);
        res.status(500).json({ message: 'Error al actualizar la sesión' });
    }
});


// Ruta de estado de la sesión
app.get("/status", async (req, res) => {
    const { sessionID } = req.query;

    if (!sessionID) {
        return res.status(400).json({ message: 'El sessionID es necesario' });
    }

    try {
        const session = await Session.findOne({ sessionID }).exec();
        if (!session) {
            return res.status(404).json({ message: 'Sesión no encontrada' });
        }

        const now = new Date();
        const idleTime = (now - new Date(session.lastAccessed)) / 1000;
        const duration = (now - new Date(session.createdAt)) / 1000;

        res.status(200).json({
            message: 'Sesión activa',
            session,
            idleTime: `${idleTime} segundos`,
            duration: `${duration} segundos`
        });
    } catch (error) {
        console.error(" Error obteniendo la sesión:", error);
        res.status(500).json({ message: 'Error al obtener la sesión' });
    }
});


// Ruta para obtener todas las sesiones
app.get('/allSessions', async (req, res) => {
    try {
        const sessions = await Session.find().exec();
        res.status(200).json({
            message: 'Lista de todas las sesiones',
            sessions
        });
    } catch (error) {
        console.error(" Error obteniendo todas las sesiones:", error);
        res.status(500).json({ message: 'Error al obtener todas las sesiones' });
    }
});


//obtiene las sesiones activas
app.get('/allCurrentSessions', async (req, res) => {
    try {
        const activeSessions = await Session.find({ status: "active" }).exec();
        res.status(200).json({
            message: 'Sesiones activas',
            activeSessions
        });
    } catch (error) {
        console.error(" Error obteniendo las sesiones activas:", error);
        res.status(500).json({ message: 'Error al obtener las sesiones activas' });
    }
});


// Ruta para eliminar todas las sesiones
app.delete('/deleteAllSessions', async (req, res) => {
    try {
        await Session.deleteMany({}).exec();
        console.log(" Todas las sesiones han sido eliminadas");
        res.status(200).json({
            message: 'Todas las sesiones han sido eliminadas'
        });
    } catch (error) {
        console.error(" Error eliminando todas las sesiones:", error);
        res.status(500).json({ message: 'Error al eliminar todas las sesiones' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Server iniciado en http://localhost:${PORT}`);
});
