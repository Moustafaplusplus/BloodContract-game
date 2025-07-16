import express from 'express';
import { BankController } from '../controllers/BankController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply auth middleware to all bank routes
router.use(auth);

// GET /api/bank - Get account balance and cash
router.get('/', BankController.getAccountInfo);

// GET /api/bank/history - Get transaction history
router.get('/history', BankController.getTransactionHistory);

// POST /api/bank/deposit - Deposit cash to bank
router.post('/deposit', validate('bankTransaction'), BankController.deposit);

// POST /api/bank/withdraw - Withdraw cash from bank
router.post('/withdraw', validate('bankTransaction'), BankController.withdraw);

export default router; 