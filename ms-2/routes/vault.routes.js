const router = require('express').Router();
const Vault = require('../models/Vault');
const auth = require('../middleware/auth.middleware');
const { encrypt, decrypt } = require('../utils/cripto');

// Proteger todas las rutas
router.use(auth);

// Obtener todas las contraseñas del usuario
router.get('/', async (req, res) => {
    try {
        const entries = await Vault.find({ userId: req.user.userId });

        // Desciframos las contraseñas 
        const decryptedEntries = entries.map(entry => {
            return {
                _id: entry._id,
                website_name: entry.website_name,
                email_or_username: entry.email_or_username,
                password: decrypt(entry.password),
                createdAt: entry.createdAt
            };
        });

        res.status(200).json(decryptedEntries);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar la bóveda" });
        console.log(error);
        
    }
});

// Agregar una nueva credencial a la bóveda
router.post('/', async (req, res) => {
    try {
        const { website_name, email_or_username, password } = req.body;

        const newEntry = await Vault.create({
            userId: req.user.userId,
            website_name,
            email_or_username,
            password: encrypt(password), // Ciframos antes de guardar en BD
        });

        // Devolvemos el registro con la contraseña descifrada para confirmar
        res.status(201).json({
            ...newEntry._doc,
            password: decrypt(newEntry.password)
        });
    } catch (error) {
        res.status(400).json({ message: "Error al guardar la credencial", error: error.message });
    }
});

// Actualizar una credencial
router.put('/:id', async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Si el usuario envía una nueva contraseña, la ciframos antes de actualizar
        if (updateData.password) {
            updateData.password = encrypt(updateData.password);
        }

        const entry = await Vault.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateData,
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ message: "Registro no encontrado" });
        }

        res.status(200).json({
            ...entry._doc,
            password: decrypt(entry.password)
        });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar la credencial" });
    }
});

// Eliminar una credencial
router.delete('/:id', async (req, res) => {
    try {
        const entry = await Vault.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!entry) {
            return res.status(404).json({ message: "Registro no encontrado" });
        }
        res.status(200).json({ message: "Credencial eliminada de forma segura" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la credencial" });
    }
});

module.exports = router;