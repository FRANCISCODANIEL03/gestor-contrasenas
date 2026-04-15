const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// NGINX enruta /api1/register -> /register
router.post('/register', authController.register);

// NGINX enruta /api1/login -> /login
router.post('/login', authController.login);

// NGINX enruta /api1/verify -> /verify
router.post('/verify', authController.verify);

module.exports = router;