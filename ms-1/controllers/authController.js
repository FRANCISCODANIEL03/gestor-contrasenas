const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '2h';

// Lógica de Registro
exports.register = async (req, res) => {
  const { username, password } = req.body;
  console.log(`[Auth] Registro solicitado por ${username} desde ${os.hostname()}`);
  
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password_hash });
    
    await newUser.save();
    
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      userId: newUser._id,
      token: token,
      expires_in: TOKEN_EXPIRATION,
      handled_by: os.hostname()
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'El usuario ya existe' });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Lógica de Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  try {
    const user = await User.findOne({ username, is_active: true });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    res.json({ 
      token, 
      handled_by: os.hostname() 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Lógica de Verificación
exports.verify = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ 
      valid: true, 
      user: decoded, 
      handled_by: os.hostname() 
    });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Token inválido o expirado' });
  }
};