import express from 'express';
const router = express.Router();
import { addStudent, getStudents, bulkAddStudents } from '../controllers/studentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, adminOnly, addStudent)
    .get(protect, getStudents);

// Bulk upload route (allow any authenticated user)
router.route('/bulk').post(protect, bulkAddStudents);


    
export default router;
