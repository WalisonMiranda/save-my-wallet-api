import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { userRouter } from "./routes/userRoutes";
import { transactionRouter } from "./routes/transactionRoutes";
import { accountRouter } from "./routes/accountRoutes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use("/auth", userRouter);
app.use("/transaction", transactionRouter);
app.use("/account", accountRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
