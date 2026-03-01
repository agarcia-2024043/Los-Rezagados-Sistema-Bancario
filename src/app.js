import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./Config/database.js";

import accountRoutes from "./Routes/account.routes.js";
import transactionRoutes from "./Routes/transaction.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
    res.json({ 
        message: "Sistema Bancario - Node.js API",
        note: "Autenticación manejada por .NET AuthService"
    });
});

app.use("/accounts", accountRoutes);
app.use("/transactions", transactionRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

export default app;
