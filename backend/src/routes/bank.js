import express from 'express';
import { BankController } from '../controllers/BankController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.use(auth);

router.get('/', BankController.getAccountInfo);
router.get('/history', BankController.getTransactionHistory);
router.post('/deposit', validate('bankTransaction'), BankController.deposit);
router.post('/withdraw', validate('bankTransaction'), BankController.withdraw);

export default router; 