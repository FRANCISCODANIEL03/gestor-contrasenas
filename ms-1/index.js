require('dotenv').config();
const express = require('express');
const os = require('os');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares globales
app.use(express.json());

// Inicializar la conexión a MongoDB
connectDB();

// Registrar las rutas
// Todas las rutas de authRoutes colgarán de la ruta '/api/users'
app.use('/api/users', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Auth] Microservicio corriendo en el puerto ${PORT} (Contenedor: ${os.hostname()})`);
});