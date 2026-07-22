import express from 'express';
const router = express.Router();
import { authUser, registerUser, inviteMember } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.post('/login', authUser);
router.post('/', registerUser);
router.post('/invite', protect, adminOnly, inviteMember);

export default router;