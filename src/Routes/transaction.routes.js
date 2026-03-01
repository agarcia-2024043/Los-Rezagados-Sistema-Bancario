import express from "express";
import {
  getTransactions,
  transfer,
} from "../Controllers/transaction.controller.js";
import { validateJWT } from "../Middleware/validate-jwt.js";

const router = express.Router();

router.use(validateJWT);

router.get("/", getTransactions);
router.post("/transfer", transfer);

export default router;
