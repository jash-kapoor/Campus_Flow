import mongoose from 'mongoose';

// NEW MODEL: This defines teachers and their subject expertise.
const teacherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    subjects: [
        {
            type: String,
            required: true,
        }
    ]
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
export { teacherSchema };
