import mongoose from 'mongoose';

// Helper function to generate a random 4-digit code
const generateRetrieveCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit number
};

// Define the updated tracking schema
const trackingSchema = new mongoose.Schema({
  senderEmail: {
    type: String,
    required: false // Adjust as needed
  },
  parcelId: {
    type: String,
    required: true // Parcel ID should be required
  },
  status: {
    type: String,
    default: 'Pending', // Default status can be adjusted
    required: true
  },
  retrieveCode: {
    type: String,
    required: true,
    default: generateRetrieveCode // Generate the code by default
  },
  readyToPickup: {
    type: Boolean,
    default: false // Default value can be adjusted
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { collection: 'tracking' });

// Create model with schema
const Tracking = mongoose.model('Tracking', trackingSchema);

export { trackingSchema, Tracking };
