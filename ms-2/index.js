const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const vaultRoutes = require('./routes/vault.routes');

const app = express();

app.use(express.json());

app.use('/api/vault', vaultRoutes);

app.get("/", (req, res) => res.json({ status: "Running!!" }));

mongoose.connect(process.env.MONGO_URL_VAULT)
    .then(() => {
        console.log("Conectado a la BD");
        app.listen(3000, '0.0.0.0', () => {
            console.log("Servidor escuchando en puerto 3000");
        });
    })
    .catch(err => {
        console.error("Error en el servidor: ", err);
    });
