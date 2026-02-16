import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["DEPOSITO", "RETIRO", "TRANSFERENCIA"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    // AQUÍ ESTABA EL ERROR:
    originAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account' // <-- Debe ser un String entre comillas
    },
    destinationAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account' // <-- Debe ser un String entre comillas
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export const Transaction = mongoose.model("Transaction", transactionSchema); 