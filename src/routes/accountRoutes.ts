import { Router } from "express";

import { getAccount } from "../controllers/accountControllet";

const accountRouter = Router();

accountRouter.get("/", getAccount);

export { accountRouter };
