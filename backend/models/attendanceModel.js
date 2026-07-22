import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    date: { 
        type: Date, 
        required: true 
    },
    batchName: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    teacherName: {
        type: String,
        required: true
    },
    presentStudents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student' 
    }]
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
export { attendanceSchema };
