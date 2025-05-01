import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { Admin } from "mongodb"

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

const ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
};

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN.email && password === ADMIN.password) {
        const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        return res.json({ token });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) return res.status(404).json({ error: "Usuário Não encontrado" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Senha Incorreta" });

    const token = jwt.sign({ id: user.id, email: user.email}, process.env.JWT_SECRET_KEY, { expiresIn: "1h"});

    res.json({ token });

});

router.post("/register", async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { email, username, password: hashedPassword, name: username, age: "0" },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: "Erro ao criar usuário" });
    }
})

export default router;