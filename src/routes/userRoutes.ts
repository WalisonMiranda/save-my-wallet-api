import { Router } from "express";

import { login, register } from "../controllers/userController";

const userRouter = Router();

userRouter.post("/login", login);
userRouter.post("/register", register);

export { userRouter };
