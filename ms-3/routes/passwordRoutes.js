const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const SECRET_TOKEN = "putoMax";

// Middleware de seguridad interno
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: "Acceso denegado." });
    }
    if (token !== SECRET_TOKEN) {
        return res.status(403).json({ success: false, error: "Token inválido." });
    }
    next();
};

// Función auxiliar
const generatePassword = (length = 8, isForVoucher = false) => {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    if (isForVoucher) chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        password += chars[randomIndex];
    }
    return password;
};

// Definición de la ruta
router.post('/generate', authenticateToken, (req, res) => {
    try {
        const { length = 8, count = 1, isForVoucher = false } = req.body;
        if (count > 100) return res.status(400).json({ error: "Máximo 100 por lote." });

        const passwords = Array.from({ length: count }, () => generatePassword(length, isForVoucher));
        
        res.status(200).json({ success: true, count: passwords.length, passwords });
    } catch (error) {
        res.status(500).json({ success: false, error: "Error interno" });
    }
});


module.exports = router;