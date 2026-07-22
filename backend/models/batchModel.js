import mongoose from 'mongoose';

const batchSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subjects: [{ type: String, required: true }],
  labs: [{ type: String, required: true }],
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
export { batchSchema };