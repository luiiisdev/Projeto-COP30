// src/middlewares/auth.js

import jwt from "jsonwebtoken";

const JWT_SECRET = "chave-secreta-supersegura"; 

export function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        // Retorna 401 se o token não for enviado
        return res.status(401).json({ error: "Token não fornecido" });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            // Retorna 403 se o token for inválido (expirado, alterado)
            return res.status(403).json({ error: "Token inválido" });
        }
        
        req.user = { id: payload.id }; 
        next();
    });
}