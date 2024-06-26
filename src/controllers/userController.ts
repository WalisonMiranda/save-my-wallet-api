import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { authenticateUser } from "../services/authService";
import { prisma } from "../lib/prisma";

const SECRET_KEY = process.env.SECRET_KEY || "34y8039hf4h3c";

interface UserRequest {
  name: string;
  email: string;
  password: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await authenticateUser(email, password);

    res.status(200).json({ token, user: user.name });
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

    const encryptedPassword = bcrypt.hashSync(password, 15);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: newUser.name });
  } catch (error) {
    res.status(500).json({ message: "Falha ao fazer o cadastro" });
  }
};
