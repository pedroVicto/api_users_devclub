import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Verifica se o cabeçalho Authorization está presente
    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    const parts = authHeader.split(" ");

    // Verifica se o formato do token está correto (deve ser "Bearer token")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Token mal formatado." });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Armazena os dados do usuário no request
        next();
    } catch (error) {
        res.status(403).json({ error: "Token inválido ou expirado." });
    }
};
