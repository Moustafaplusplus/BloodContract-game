import express from 'express';
import { SpecialShopController } from '../controllers/SpecialShopController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// GET /api/special-shop/blackcoin-packages
router.get('/blackcoin-packages', SpecialShopController.getBlackcoinPackages);
// POST /api/special-shop/buy/blackcoin
router.post('/buy/blackcoin', auth, SpecialShopController.buyBlackcoin);
// GET /api/special-shop/vip-packages
router.get('/vip-packages', SpecialShopController.getVIPPackages);
// POST /api/special-shop/buy/vip
router.post('/buy/vip', auth, SpecialShopController.buyVIP);
// GET /api/special-shop/special
router.get('/special', SpecialShopController.getSpecialItems);
// POST /api/special-shop/buy/special/:id
router.post('/buy/special/:id', auth, SpecialShopController.buySpecialItem);

export default router; 