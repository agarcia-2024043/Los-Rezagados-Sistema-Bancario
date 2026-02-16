import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";

/**
 * Obtener el historial de transferencias
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("originAccount", "accountNumber")
      .populate("destinationAccount", "accountNumber")
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener transferencias",
      error: error.message
    });
  }
};

/**
 * Realizar una transferencia entre cuentas
 */
export const transfer = async (req, res) => {
  try {
    // 1. Aquí capturamos exactamente lo que mandas en Postman
    let { fromAccountId, toAccountId, amount } = req.body;

    // 2. La validación ahora busca los nombres que TÚ quieres
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({
        message: "fromAccountId, toAccountId y amount son obligatorios",
      });
    }

    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "El monto debe ser mayor a 0" });
    }

    const fromAccount = await Account.findById(fromAccountId);
    const toAccount = await Account.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: "Una o ambas cuentas no existen" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: "Fondos insuficientes" });
    }

    // 3. Lógica de dinero
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    // 4. Guardar la transacción (mapeando a los nombres de tu esquema de Mongoose)
    const transferencia = new Transaction({
      type: "TRANSFERENCIA",
      amount,
      originAccount: fromAccountId, 
      destinationAccount: toAccountId,
    });

    await transferencia.save();

    res.json({
      message: "Transferencia realizada correctamente",
      transferencia,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al transferir dinero", error: error.message });
  }
};