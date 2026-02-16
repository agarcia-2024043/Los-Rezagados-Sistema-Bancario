import express from "express";
import {
  getTransactions,
  transfer,
} from "../Controllers/transaction.controller.js";

const router = express.Router();

router.get("/", getTransactions);
router.post("/transfer", transfer);

export default router;
