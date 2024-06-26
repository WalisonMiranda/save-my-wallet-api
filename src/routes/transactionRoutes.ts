import { Router } from "express";

import {
  addTransaction,
  getTransactions,
  deleteTransaction,
} from "../controllers/transactionController";

const transactionRouter = Router();

transactionRouter.post("/", addTransaction);
transactionRouter.get("/", getTransactions);
transactionRouter.delete("/:id", deleteTransaction);

export { transactionRouter };
