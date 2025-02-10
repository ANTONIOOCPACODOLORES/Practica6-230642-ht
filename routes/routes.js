import { Router } from 'express';
import { welcome, login, logout, updateSessionController, sessionStatus, activeSessions, allSessions, deleteAllSessionsController } from '../controllers/sessionController.js';

const router = Router();

// Ruta de bienvenida
router.get('/', welcome);

// Gestión de sesiones
router.post('/login', login);
router.post('/logout', logout);
router.put('/update', updateSessionController); // Se usa PUT para actualizar
router.get('/status', sessionStatus);
router.get('/active-sessions', activeSessions);
router.get('/all-sessions', allSessions);
router.delete('/delete-all-sessions', deleteAllSessionsController); // ⚠️ Peligroso

export default router;
