// Import required modules
import mongoose from 'mongoose';

// Define user schema
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure email uniqueness
  },
  password: {
    type: String,
    required: true
  }
}, {
    collection: 'users' // Specify the collection name
  
});

// Create a model from the user schema
const User = mongoose.model('User', userSchema); // Change 'Users' to 'User' here

export { User }; // Export the model
