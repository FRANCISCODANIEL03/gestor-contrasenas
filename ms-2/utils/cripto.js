const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// La clave debe ser exactamente de 32 bytes (64 caracteres en hexadecimal)
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
    // Generamos un Vector de Inicialización (IV) aleatorio para cada contraseña
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Guardamos el IV junto con el texto cifrado, separados por dos puntos
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedData) => {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

module.exports = { encrypt, decrypt };