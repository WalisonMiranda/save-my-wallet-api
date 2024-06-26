import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

interface JwtPayload {
  userId: string;
}

export const getAccount = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = Jwt.decode(token) as JwtPayload | null;

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const { userId } = decoded;

    const account = await prisma.account.findUnique({
      where: {
        userId,
      },
    });

    res.status(200).json({ account });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao executar operação", error: error.message });
  }
};
