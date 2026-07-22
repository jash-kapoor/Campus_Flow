import { getTenantConnection } from '../config/db.js';
import { batchSchema } from '../models/batchModel.js';
import { timetableSchema } from '../models/timetableModel.js';
import { teacherSchema } from '../models/teacherModel.js';
import { generateTimetableAlgorithm } from '../utils/timetableAlgorithm.js';

// All other functions (generateTimetable, getTimetables, etc.) remain the same...

export const generateTimetable = async (req, res) => {
    try {
        const { classrooms, labs } = req.body;
        const conn = await getTenantConnection(req.tenantId);
        const Teacher = conn.models.Teacher || conn.model('Teacher', teacherSchema);
        const Batch = conn.models.Batch || conn.model('Batch', batchSchema);
        const Timetable = conn.models.Timetable || conn.model('Timetable', timetableSchema);
        const teachers = await Teacher.find({});
        const batches = await Batch.find({});
        if (!batches.length || !teachers.length || !classrooms?.length || !labs?.length) {
            return res.status(400).json({ message: "Missing required data. Ensure teachers, batches, classrooms, and labs are configured." });
        }
        const generatedSchedules = generateTimetableAlgorithm(batches, teachers, classrooms, labs);
        await Timetable.deleteMany({});
        const timetablePromises = Object.keys(generatedSchedules).map(batchName => {
            const newTimetable = new Timetable({
                batchName,
                schedule: generatedSchedules[batchName],
            });
            return newTimetable.save();
        });
        await Promise.all(timetablePromises);
        res.status(201).json({ message: 'Timetables generated successfully!', timetables: generatedSchedules });
    } catch (error) {
        console.error('Error during timetable generation:', error);
        res.status(500).json({ message: 'Server error during timetable generation.' });
    }
};

export const getTimetables = async (req, res) => {
    try {
        const conn = await getTenantConnection(req.tenantId);
        const Timetable = conn.models.Timetable || conn.model('Timetable', timetableSchema);
        const timetables = await Timetable.find({});
        res.json(timetables);
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const addOrUpdateBatch = async (req, res) => {
    const { name, subjects, labs } = req.body;
    if (!name || !subjects || !labs) {
        return res.status(400).json({ message: "Please provide a name, a list of subjects, and a list of labs." });
    }
    try {
        const conn = await getTenantConnection(req.tenantId);
        const Batch = conn.models.Batch || conn.model('Batch', batchSchema);
        const batch = await Batch.findOneAndUpdate({ name }, { subjects, labs }, { new: true, upsert: true });
        res.status(201).json(batch);
    } catch(error) {
        console.error('Error adding/updating batch:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getBatches = async (req, res) => {
     try {
        const conn = await getTenantConnection(req.tenantId);
        const Batch = conn.models.Batch || conn.model('Batch', batchSchema);
        const batches = await Batch.find({});
        res.json(batches);
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// --- THIS IS THE FIX ---
// Adds the logic to delete a batch from the database.
export const deleteBatch = async (req, res) => {
    try {
        const conn = await getTenantConnection(req.tenantId);
        const Batch = conn.models.Batch || conn.model('Batch', batchSchema);
        const Timetable = conn.models.Timetable || conn.model('Timetable', timetableSchema);
        const batch = await Batch.findById(req.params.id);

        if (batch) {
            await batch.deleteOne();
            // Also delete any generated timetable associated with this batch
            await Timetable.deleteMany({ batchName: batch.name });
            res.json({ message: 'Batch removed' });
        } else {
            res.status(404).json({ message: 'Batch not found' });
        }
    } catch (error) {
        console.error('Error deleting batch:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

