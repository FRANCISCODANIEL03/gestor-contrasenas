const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/passwords', passwordRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'ms-3' });
});

app.listen(PORT, () => {
    console.log(`Microservicio 3 corriendo en el puerto ${PORT}`);
});