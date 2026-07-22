import mongoose from 'mongoose';

const timetableSchema = mongoose.Schema({
  batchName: { type: String, required: true },
  schedule: { type: Object, required: true },
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
export { timetableSchema };