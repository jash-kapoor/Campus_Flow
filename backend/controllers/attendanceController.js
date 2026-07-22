import { getTenantConnection } from '../config/db.js';
import { attendanceSchema } from '../models/attendanceModel.js';
import { studentSchema } from '../models/studentModel.js';

// Mark attendance for a specific class
export const markAttendance = async (req, res) => {
    const { date, batchName, subject, teacherName, presentStudents } = req.body;
    if (!date || !batchName || !subject || !teacherName || !presentStudents) {
        return res.status(400).json({ message: "Missing required attendance information." });
    }

    try {
        const conn = await getTenantConnection(req.tenantId);
        const Attendance = conn.models.Attendance || conn.model('Attendance', attendanceSchema);
        conn.models.Student || conn.model('Student', studentSchema);
        const newRecord = new Attendance({ date, batchName, subject, teacherName, presentStudents });
        await newRecord.save();
        res.status(201).json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error marking attendance.' });
    }
};

// Get attendance records, with filtering options
export const getAttendance = async (req, res) => {
    try {
        const conn = await getTenantConnection(req.tenantId);
        const Attendance = conn.models.Attendance || conn.model('Attendance', attendanceSchema);
        conn.models.Student || conn.model('Student', studentSchema);
        const { batchName, date } = req.query;
        const query = {};
        if (batchName) query.batchName = batchName;
        if (date) {
            // Query for records on a specific day
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lt: end };
        }
        
        const records = await Attendance.find(query).populate('presentStudents', 'name rollNumber');
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching attendance.' });
    }
};
