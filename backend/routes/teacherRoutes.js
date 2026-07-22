import express from 'express';
const router = express.Router();
// Make sure to import the new deleteTeacher function
import { addTeacher, getTeachers, deleteTeacher } from '../controllers/teacherController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, getTeachers)
  .post(protect, adminOnly, addTeacher);

// --- THIS IS THE FIX ---
// This new route handles DELETE requests for a specific teacher by their ID
router.route('/:id').delete(protect, adminOnly, deleteTeacher);

export default router;

