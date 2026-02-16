import { Router } from 'express';
import { 
    createAccount, 
    getAccounts, 
    deposit, 
    withdraw 
} from '../Controllers/account.controller.js';

const router = Router();

// POST /api/accounts/create - Crear nueva cuenta
router.post('/create', createAccount);

// GET /api/accounts - Obtener todas las cuentas
router.get('/', getAccounts);

// POST /api/accounts/deposit - Depositar dinero
router.post('/deposit', deposit);

// POST /api/accounts/withdraw - Retirar dinero
router.post('/withdraw', withdraw);

export default router;