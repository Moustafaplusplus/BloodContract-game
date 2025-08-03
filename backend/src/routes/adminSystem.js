import express from 'express';
import { AdminSystemController, uploadCar, uploadHouse, uploadDog, uploadWeapon, uploadArmor } from '../controllers/AdminSystemController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';
import * as AdminCarHouseDog from '../controllers/AdminSystemController.js';

const router = express.Router();

// Apply auth and admin middleware to all admin system routes
router.use(firebaseAuth);
router.use(adminAuth);

// User management routes
router.post('/users/:userId/ban', AdminSystemController.toggleUserBan);
router.post('/users/:userId/login-token', AdminSystemController.generateUserLoginToken);
router.get('/users/:userId/inventory', AdminSystemController.getUserInventory);

// IP management routes
router.get('/users/:userId/ips', AdminSystemController.getUserIps);
router.post('/ips/block', AdminSystemController.blockIp);
router.delete('/ips/:ipAddress/unblock', AdminSystemController.unblockIp);
router.get('/ips/blocked', AdminSystemController.getBlockedIps);
router.get('/ips/flagged', AdminSystemController.getFlaggedIps);
router.get('/ips/stats', AdminSystemController.getIpStats);

// Car admin
router.get('/cars', AdminCarHouseDog.getAllCars);
router.post('/cars', AdminCarHouseDog.createCar);
router.put('/cars/:id', AdminCarHouseDog.updateCar);
router.delete('/cars/:id', AdminCarHouseDog.deleteCar);
router.post('/cars/upload-image', AdminCarHouseDog.uploadCarImage);

// House admin
router.get('/houses', AdminCarHouseDog.getAllHouses);
router.post('/houses', AdminCarHouseDog.createHouse);
router.put('/houses/:id', AdminCarHouseDog.updateHouse);
router.delete('/houses/:id', AdminCarHouseDog.deleteHouse);
router.post('/houses/upload-image', AdminCarHouseDog.uploadHouseImage);

// Dog admin
router.get('/dogs', AdminCarHouseDog.getAllDogs);
router.post('/dogs', AdminCarHouseDog.createDog);
router.put('/dogs/:id', AdminCarHouseDog.updateDog);
router.delete('/dogs/:id', AdminCarHouseDog.deleteDog);
router.post('/dogs/upload-image', AdminCarHouseDog.uploadDogImage);

// Weapon admin
router.get('/weapons', AdminSystemController.getAllWeapons);
router.post('/weapons', AdminSystemController.createWeapon);
router.put('/weapons/:id', AdminSystemController.updateWeapon);
router.delete('/weapons/:id', AdminSystemController.deleteWeapon);
router.post('/weapons/upload-image', uploadWeapon.single('image'), AdminSystemController.uploadWeaponImage);

// Armor admin
router.get('/armors', AdminSystemController.getAllArmors);
router.post('/armors', AdminSystemController.createArmor);
router.put('/armors/:id', AdminSystemController.updateArmor);
router.delete('/armors/:id', AdminSystemController.deleteArmor);
router.post('/armors/upload-image', uploadArmor.single('image'), AdminSystemController.uploadArmorImage);

// Blackcoin Package admin
router.get('/blackcoin-packages', AdminSystemController.getAllBlackcoinPackages);
router.post('/blackcoin-packages', AdminSystemController.createBlackcoinPackage);
router.put('/blackcoin-packages/:id', AdminSystemController.updateBlackcoinPackage);
router.delete('/blackcoin-packages/:id', AdminSystemController.deleteBlackcoinPackage);

// VIP Package admin
router.get('/vip-packages', AdminSystemController.getAllVIPPackages);
router.post('/vip-packages', AdminSystemController.createVIPPackage);
router.put('/vip-packages/:id', AdminSystemController.updateVIPPackage);
router.delete('/vip-packages/:id', AdminSystemController.deleteVIPPackage);

// Money Package admin
router.get('/money-packages', AdminSystemController.getAllMoneyPackages);
router.post('/money-packages', AdminSystemController.createMoneyPackage);
router.put('/money-packages/:id', AdminSystemController.updateMoneyPackage);
router.delete('/money-packages/:id', AdminSystemController.deleteMoneyPackage);

// Statistics routes
router.get('/users/:userId/stats', AdminSystemController.getUserStats);
router.get('/stats', AdminSystemController.getSystemStats);

export default router; 