// backend/src/routes/friends.js
import express from 'express';
import * as svc from '../services/friendService.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, svc.list);
router.post('/:userId', auth, svc.sendRequest);
router.post('/:userId/accept', auth, svc.accept);
router.delete('/:userId', auth, svc.remove);

export default router;
