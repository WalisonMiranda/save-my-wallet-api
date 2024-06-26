import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";

const SECRET_KEY = process.env.SECRET_KEY || "34y8039hf4h3c";

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("e-mail ou senha incorretos");
  }

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
    expiresIn: "7d",
  });

  return { token, user };
};
