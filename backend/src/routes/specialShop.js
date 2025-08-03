import express from 'express';
import { SpecialShopController } from '../controllers/SpecialShopController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// GET /api/special-shop/blackcoin-packages
router.get('/blackcoin-packages', SpecialShopController.getBlackcoinPackages);
// POST /api/special-shop/buy/blackcoin
router.post('/buy/blackcoin', firebaseAuth, SpecialShopController.buyBlackcoin);
// GET /api/special-shop/vip-packages
router.get('/vip-packages', SpecialShopController.getVIPPackages);
// POST /api/special-shop/buy/vip
router.post('/buy/vip', firebaseAuth, SpecialShopController.buyVIP);
// GET /api/special-shop/special
router.get('/special', SpecialShopController.getSpecialItems);
// POST /api/special-shop/buy/special/:id
router.post('/buy/special/:id', firebaseAuth, SpecialShopController.buySpecialItem);

// POST /api/special-shop/buy/weapon/:id
router.post('/buy/weapon/:id', firebaseAuth, SpecialShopController.buyWeapon);
// POST /api/special-shop/buy/armor/:id
router.post('/buy/armor/:id', firebaseAuth, SpecialShopController.buyArmor);

// GET /api/special-shop/cars
router.get('/cars', SpecialShopController.getSpecialCars);
// GET /api/special-shop/houses
router.get('/houses', SpecialShopController.getSpecialHouses);
// GET /api/special-shop/dogs
router.get('/dogs', SpecialShopController.getSpecialDogs);

// GET /api/special-shop/money-packages
router.get('/money-packages', SpecialShopController.getMoneyPackages);
// POST /api/special-shop/buy/money
router.post('/buy/money', firebaseAuth, SpecialShopController.buyMoney);

export default router; 