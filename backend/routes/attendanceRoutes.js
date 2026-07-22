import express from 'express';
const router = express.Router();
import { markAttendance, getAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, markAttendance)
    .get(protect, getAttendance);

export default router;
