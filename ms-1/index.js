const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');
require('dotenv').config();

const app = express();
app.use(express.json());

// URI de conexión al Replica Set de MongoDB (rs_users)
// Usa las credenciales y contenedores definidos en tu docker-compose
const MONGO_URI = process.env.MONGO_URI || 'mongodb://users:1234U@mongo_users_1:27017,mongo_users_2:27017,mongo_users_3:27017/auth_db?replicaSet=rs_users&authSource=admin';

mongoose.connect(MONGO_URI)
  .then(() => console.log(`[Auth] Conectado al Replica Set rs_users desde ${os.hostname()}`))
  .catch(err => console.error('[Auth] Error conectando a MongoDB:', err));

// Esquema y Modelo de Usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  is_active: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '2h';

// ==========================================
// RUTAS (NGINX las enruta desde /api1/*)
// ==========================================

// Endpoint: Registro (NGINX: POST /api1/register)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password_hash });
    await newUser.save();
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      userId: newUser._id,
      handled_by: os.hostname()
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'El usuario ya existe' });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint: Iniciar Sesión (NGINX: POST /api1/login)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  try {
    const user = await User.findOne({ username, is_active: true });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generar Token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    res.json({ 
      token, 
      expires_in: TOKEN_EXPIRATION, 
      handled_by: os.hostname() 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint: Validar Token (NGINX: POST /api1/verify)
// Útil para que el Frontend u otros MS verifiquen si la sesión sigue activa
app.post('/verify', (req, res) => {
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
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`[Auth] Microservicio corriendo en el puerto ${PORT} (Contenedor: ${os.hostname()})`);
});