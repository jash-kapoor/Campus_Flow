import express from 'express';
const router = express.Router();
// --- Make sure `deleteBatch` is imported from your controller ---
import { 
    generateTimetable, 
    getTimetables, 
    addOrUpdateBatch, 
    getBatches, 
    deleteBatch 
} from '../controllers/timetableController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getTimetables);
router.route('/generate').post(protect, adminOnly, generateTimetable);

router.route('/batch')
  .post(protect, adminOnly, addOrUpdateBatch)
  .get(protect, getBatches);

// --- THIS IS THE NEWLY ADDED ROUTE ---
// It handles DELETE requests for a specific batch by its ID.
router.route('/batch/:id').delete(protect, adminOnly, deleteBatch);

export default router;

