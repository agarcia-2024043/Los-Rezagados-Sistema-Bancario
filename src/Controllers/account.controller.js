import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";
// Generar número de cuenta simple
const generarNumeroCuenta = () => {
    return "ACC" + Math.floor(100000 + Math.random() * 900000);
};

// =====================================================
// CREAR CUENTA
// =====================================================
export const createAccount = async (req, res) => {
    try {
        const { userId, type, initialBalance } = req.body;

        if (!userId || !type) {
            return res.status(400).json({ 
                message: "userId y type son obligatorios" 
            });
        }

        if (type !== "ahorro" && type !== "monetaria") {
            return res.status(400).json({ 
                message: "El tipo debe ser ahorro o monetaria" 
            });
        }

        if (initialBalance && initialBalance < 0) {
            return res.status(400).json({ 
                message: "El saldo inicial no puede ser negativo" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: "Usuario no encontrado" 
            });
        }

        const cuentaExistente = await Account.findOne({ userId, type });
        if (cuentaExistente) {
            return res.status(400).json({ 
                message: "El usuario ya tiene una cuenta de este tipo" 
            });
        }

        const nuevaCuenta = new Account({
            userId,
            accountNumber: generarNumeroCuenta(),
            type,
            balance: initialBalance || 0
        });

        await nuevaCuenta.save();
        
        res.status(201).json({
            success: true,
            message: "Cuenta creada exitosamente",
            account: nuevaCuenta
        });

    } catch (error) {
        console.error("Error al crear cuenta:", error);
        res.status(500).json({ 
            message: "Error al crear cuenta",
            error: error.message 
        });
    }
};

// =====================================================
// OBTENER TODAS LAS CUENTAS
// =====================================================
export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find().populate("userId", "name email");
        res.json({
            success: true,
            total: accounts.length,
            accounts
        });
    } catch (error) {
        console.error("Error al obtener cuentas:", error);
        res.status(500).json({ 
            message: "Error al obtener cuentas" 
        });
    }
};

// =====================================================
// DEPOSITAR DINERO
// =====================================================
export const deposit = async (req, res) => {
    try {
        const { accountId, amount } = req.body;

        if (!accountId || !amount) {
            return res.status(400).json({ 
                message: "accountId y amount son obligatorios" 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ 
                message: "El monto debe ser mayor a 0" 
            });
        }

        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ 
                message: "Cuenta no encontrada" 
            });
        }

        account.balance += amount;
        await account.save();

        res.json({
            success: true,
            message: "Depósito realizado exitosamente",
            account: {
                id: account._id,
                accountNumber: account.accountNumber,
                balance: account.balance
            }
        });
    } catch (error) {
        console.error("Error al depositar:", error);
        res.status(500).json({ 
            message: "Error al depositar" 
        });
    }
};

// =====================================================
// RETIRAR DINERO
// =====================================================
export const withdraw = async (req, res) => {
    try {
        const { accountId, amount } = req.body;

        if (!accountId || !amount) {
            return res.status(400).json({ 
                message: "accountId y amount son obligatorios" 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ 
                message: "El monto debe ser mayor a 0" 
            });
        }

        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ 
                message: "Cuenta no encontrada" 
            });
        }

        if (account.balance < amount) {
            return res.status(400).json({ 
                message: "Fondos insuficientes",
                balanceActual: account.balance,
                montoSolicitado: amount
            });
        }

        account.balance -= amount;
        await account.save();

        res.json({
            success: true,
            message: "Retiro realizado exitosamente",
            account: {
                id: account._id,
                accountNumber: account.accountNumber,
                balance: account.balance
            }
        });
    } catch (error) {
        console.error("Error al retirar:", error);
        res.status(500).json({ 
            message: "Error al retirar" 
        });
    }
};