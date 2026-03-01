import { Router } from 'express';
import { 
    createAccount, 
    getAccounts, 
    deposit, 
    withdraw 
} from '../Controllers/account.controller.js';
import { validateJWT, requireRole } from '../Middleware/validate-jwt.js';

const router = Router();

// Todas las rutas de cuentas requieren autenticación
router.use(validateJWT);

// POST /api/accounts/create - Crear nueva cuenta (Admin o Cliente)
router.post('/create', requireRole('Admin', 'Cliente'), createAccount);

// GET /api/accounts - Obtener todas las cuentas (Admin) o las propias (Cliente)
router.get('/', getAccounts);

// POST /api/accounts/deposit - Depositar dinero
router.post('/deposit', deposit);

// POST /api/accounts/withdraw - Retirar dinero
router.post('/withdraw', withdraw);

export default router;
