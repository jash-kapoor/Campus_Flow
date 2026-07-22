import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    rollNumber: { 
        type: String, 
        required: true 
    },
    batchName: { 
        type: String, 
        required: true 
    },
    // This will store the mathematical representation of the student's face
    faceDescriptor: {
        type: [Number],
        required: true
    }
}, { timestamps: true });

// Ensure roll number is unique within a specific batch
studentSchema.index({ rollNumber: 1, batchName: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
export { studentSchema };
