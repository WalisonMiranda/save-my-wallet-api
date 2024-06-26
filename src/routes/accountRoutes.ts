import { Router } from "express";

import { getAccount } from "../controllers/accountControllet";

const accountRouter = Router();

accountRouter.post("/", getAccount);

export { accountRouter };
