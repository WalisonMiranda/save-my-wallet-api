import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

interface JwtPayload {
  userId: string;
}

interface TransactionRequest {
  ammount: number;
  category: "Despesa" | "Recebimento";
  description?: string;
  date: string;
}

// CREATE
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { ammount, category, date, description } =
      req.body as TransactionRequest;
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

    await prisma.transaction.create({
      data: {
        ammount,
        description,
        category,
        date,
        userId,
      },
    });

    let account = await prisma.account.findUnique({ where: { userId } });

    if (account) {
      if (category === "Despesa") {
        account.ammount = account.ammount - ammount;
      } else if (category === "Recebimento") {
        account.ammount = account.ammount + ammount;
      }

      await prisma.account.update({
        where: {
          userId,
        },
        data: {
          ammount: account.ammount,
        },
      });
    }

    res.status(201).json({ message: "Transação adicionada" });
  } catch (error: any) {
    console.log(error);
    console.log(req.body);
    res
      .status(500)
      .json({ message: "Erro ao executar transação", error: error.message });
  }
};

// GET ALL
export const getTransactions = async (req: Request, res: Response) => {
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      transactions,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao executar transação", error: error.message });
  }
};

// DELETE
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
        userId,
      },
    });

    let account = await prisma.account.findUnique({ where: { userId } });

    if (account) {
      if (transaction.category === "Despesa") {
        account.ammount = account.ammount + transaction.ammount;
      } else if (transaction.category === "Recebimento") {
        account.ammount = account.ammount - transaction.ammount;
      }

      await prisma.account.update({
        where: {
          userId,
        },
        data: {
          ammount: account.ammount,
        },
      });
    }

    res.status(200).json({ message: "Transação apagada com sucesso" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao executar transação", error: error.message });
  }
};
