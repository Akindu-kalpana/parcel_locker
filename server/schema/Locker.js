import mongoose from 'mongoose';

const lockerSchema = new mongoose.Schema({
  parcelId: {
    type: String,
    required: false,
    default: null,
    unique: true
  },
  lockerId: {
    type: String,
    default: null,
    required: false
  },
  location: {
    type: String,
    required: false,
    default: null
  },
  lockerOpenCode: {
    type: String,
    default: null,
    required: false
  },
  opened: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, collection: 'locker' });

const Locker = mongoose.model('Locker', lockerSchema);

export { Locker };
