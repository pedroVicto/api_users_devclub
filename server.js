import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { verifyToken } from "./middlewares/auth.js";
import authRouter from "./routes/auth.js";
import errorHandler from "./middlewares/errorHandler.js";
import bcrypt from 'bcryptjs';

dotenv.config();



const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());
//midleware global para tratamento de erros
app.use(errorHandler)

app.use("/auth", authRouter);

// Criar usuário (Apenas usuário autenticado)
app.post("/usuarios", verifyToken, async (req, res) => {
  const { email, username, name, age, password } = req.body;
  const creatorId = req.user.id;

  try {
    // Validação básica
    if (!email || !username || !name || !age || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "E-mail já está em uso." });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do usuário
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        name,
        age,
        password: hashedPassword,
        createdBy: creatorId,
      },
    });

    res.status(201).json(newUser);

  } catch (error) {
    console.error("Erro ao criar usuário:", error); // <--- Mostra o erro no terminal
    res.status(500).json({ error: "Erro interno ao criar usuário." });
  }
});

// Editar usuário (Apenas o criador pode editar)
app.put("/usuarios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { email, name, age } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Você só pode editar usuários que criou." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, name, age },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: "Erro ao editar usuário." });
  }
});

// Listar usuários (Admin vê todos, usuário normal vê apenas os seus)
app.get("/usuarios", verifyToken, async (req, res) => {
  const { id, role } = req.user;

  try {
    const users = role === "admin"
      ? await prisma.user.findMany()
      : await prisma.user.findMany({ where: { createdBy: id } });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});


// Deletar usuário (Criador pode deletar seus próprios usuários, admin pode deletar qualquer um)
app.delete("/usuarios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });

    if (!userToDelete) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (req.user.role !== "admin" && userToDelete.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para deletar este usuário." });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});

/*
    1) tipo de rota /Método HTTP
    2) Endereço 


    Criar nossa API de usuarios:

    - Criar um novo usuário
    - Listar todos os usuários
    - Editar os usuarios
    -deletar um usuário

    victorpedrosilva445
    K1tun94UgPItOiB3
*/