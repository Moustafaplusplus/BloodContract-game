import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();

// POST /api/signup - Register new user
router.post('/signup', UserController.signup);

// POST /api/login - Login user
router.post('/login', UserController.login);

// GET /api/users - Get all users (public endpoint)
router.get('/users', UserController.getAllUsers);

export default router; 