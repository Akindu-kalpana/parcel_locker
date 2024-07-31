import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './schema/User.js';
import sgMail from '@sendgrid/mail';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { Tracking } from './schema/tracking.js';
import { Shipment } from './schema/Shipment.js';
import { Locker } from './schema/Locker.js';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;

import e from 'express';


dotenv.config();

var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});


// Passport Local Strategy for authentication
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return done(null, false, { message: 'Incorrect password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, userEmail) => {
    if (err) return res.sendStatus(403);
    req.userEmail = userEmail;
    next();
  })
}

// Login endpoint using Passport
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (!user) {
      // User not found or incorrect email/password
      return res.status(400).json({ error: info.message });
    }

    const userEmail = user.email;

    const accessToken = jwt.sign({ email: userEmail }, process.env.JWT_SECRET);

    // console.log('Token:', accessToken);


    // Send success message
    return res.status(200).json({ accessToken: accessToken });
  })(req, res, next);
});


// Logout endpoint
app.post('/api/logout', (req, res) => {
  // Clear isLogged from the session upon logout
  req.logout(); // Optional: If you are using passport, you can also call req.logout() to remove the user from the session
  // Send success message
  res.status(200).json({ message: 'Logout successful' });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ userName, email, password: hashedPassword }); // Save the hashed password
    await newUser.save();

    // Send success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    // Send internal server error message
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


////////////////////////////////////////////////////////

const generateLockerOpenCodeUser = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit code
};


// Utility function to generate a unique 4-digit parcel ID
const generateUniqueParcelId = async () => {
  let unique = false;
  let parcelId;

  while (!unique) {
    // Generate a random 4-digit number
    parcelId = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if the parcelId already exists in the Shipment collection
    const existingShipment = await Shipment.findOne({ parcelId });
    if (!existingShipment) {
      unique = true;
    }
  }

  return parcelId;
};


const getAvailableLockerId = async (location) => {
  // Define lockers for each location
  const locationLockers = {
    'Location1': ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15'],
    'Location2': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15'],
    'Location3': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15'],
    'Location4': ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15'],
    'Location5': ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15']
  };
  

  console.log('Requested Location:', location); // Debugging line
  // Check if the location is valid
  if (!locationLockers[location]) {
    throw new Error('Invalid location');
  }

  // Get all lockers for the specified location
  const allLockers = locationLockers[location];

  // Find all occupied locker IDs for the specified location
  const occupiedLockers = await Locker.find({ location }).distinct('lockerId').exec();

  // Filter out occupied lockers
  const availableLockers = allLockers.filter(lockerId => !occupiedLockers.includes(lockerId));

  if (availableLockers.length === 0) {
    throw new Error('No available lockers at the specified location');
  }

  // Randomly select an available locker
  return availableLockers[Math.floor(Math.random() * availableLockers.length)];
};



// Define an endpoint to create a new shipment
app.post('/api/shipment', async (req, res) => {
  try {
    const {
      parcelWidth,
      parcelHeight,
      parcelDepth,
      recipientName,
      recipientAddress,
      recipientMobileNumber,
      senderName,
      senderAddress,
      senderPhoneNumber,
      senderEmail,
      recipientEmail, // Include recipientEmail
      location // Include location
    } = req.body;

    // Generate a unique 4-digit parcel ID
    const parcelId = await generateUniqueParcelId();

    // Create a new Shipment record
    const newShipment = new Shipment({
      parcelWidth,
      parcelHeight,
      parcelDepth,
      recipientName,
      recipientAddress,
      recipientMobileNumber,
      senderName,
      senderAddress,
      senderPhoneNumber,
      senderEmail,
      parcelId,
      location // Save the location field
    });

    await newShipment.save();

    // Create a new Tracking record
    const newTracking = new Tracking({
      senderEmail,
      receiverEmail: recipientEmail,
      tracking: 'Not Enabled',
      parcelId,
      retrieveCode: generateRetrieveCode(), // Function to generate a random 4-digit retrieve code
      readyToPickUp: false // Default value, can be updated later
    });

    await newTracking.save();

    // Assign a random locker ID to the shipment
    const lockerId = await getAvailableLockerId(location);

    const lockerOpenCode = await generateLockerOpenCodeUser();

    const newLocker = new Locker({
      parcelId,
      lockerId,
      location,
      lockerOpenCode
    });

    await newLocker.save();

    res.status(201).json({
      message: 'Shipment created successfully',
      parcelId,
      lockerId,
      lockerOpenCode // Include the lockerOpenCode in the response
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Utility function to generate a random 4-digit retrieve code
const generateRetrieveCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Define an endpoint to fetch user data from the database
app.get('/api/userData/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch tracking records where senderEmail or receiverEmail matches the provided email
    const trackingRecords = await Tracking.find({
      $or: [{ senderEmail: email }, { receiverEmail: email }]
    });

    if (trackingRecords.length === 0) {
      return res.status(404).json({ message: 'No tracking records found for this email' });
    }

    // Extract parcel IDs from the tracking records
    const parcelIds = trackingRecords.map(record => record.parcelId);

    // Fetch shipment records based on parcel IDs
    const shipmentRecords = await Shipment.find({ parcelId: { $in: parcelIds } });

    // Combine tracking records with corresponding shipment details
    const results = trackingRecords.map(record => {
      const shipmentDetail = shipmentRecords.find(shipment => shipment.parcelId === record.parcelId);
      return {
        ...record.toObject(), // Spread the tracking record
        ...shipmentDetail.toObject() // Spread the shipment detail if exists
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Define an endpoint to delete a user account
app.delete('/api/deleteAccount/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Delete all shipments associated with the email
    // await Shipment.deleteMany({ senderEmail: email });

    // Delete all tracking records associated with the email
    // await Tracking.deleteMany({ senderEmail: email });

    // Delete the user account
    await User.deleteOne({ email });

    // Optionally, handle any other necessary clean-up operations

    res.status(200).json({ message: 'Account and associated records deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




///////////////////////// Locker 




// Define the endpoint to check for existing opening code and return parcelId
app.post('/api/check-locker-code', async (req, res) => {
  try {
    const { location, openingCode } = req.body;

    // Validate location and opening code
    if (!location || !openingCode) {
      return res.status(400).json({ error: 'Location and opening code are required' });
    }

    // Find a locker with the same opening code in the specified location
    const locker = await Locker.findOne({ location, lockerOpenCode: openingCode }).exec();

    if (locker) {
      // Update the locker record to set opened to true
      await Locker.updateOne({ _id: locker._id }, { $set: { opened: true } }).exec();
      
      // Respond with success message and locker details including parcelId
      return res.status(200).json({ 
        message: 'DOOR', 
        lockerId: locker.lockerId, 
        parcelId: locker.parcelId // Send parcelId to frontend
      });
    }

    // If no locker with the same opening code is found in the specified location, check all locations
    const lockerInAnyLocation = await Locker.findOne({ lockerOpenCode: openingCode }).exec();
    if (lockerInAnyLocation) {
      // If a locker with the code is found in a different location
      return res.status(200).json({ 
        message: `The code is correct but belongs to a locker in ${lockerInAnyLocation.location}`, 
        exists: true 
      });
    } else {
      // If no locker with the same opening code is found
      return res.status(200).json({ 
        message: 'No locker with this opening code found', 
        exists: false 
      });
    }
  } catch (error) {
    console.error('Error checking locker code:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Define the endpoint to close a locker
app.post('/api/close-locker', async (req, res) => {
  try {
    const { location, openingCode, parcelId } = req.body;

    // Validate location, opening code, and parcelId
    if (!location || !openingCode || !parcelId) {
      return res.status(400).json({ error: 'Location, opening code, and parcel ID are required' });
    }

    // Find the locker with the provided opening code in the specified location
    const locker = await Locker.findOne({ location, lockerOpenCode: openingCode }).exec();

    if (locker) {
      // Update the locker record to set opened to false
      await Locker.updateOne({ _id: locker._id }, { $set: { opened: false } }).exec();

      // Update the parcel status in the Tracking collection
      await Tracking.updateOne({ parcelId }, { $set: { status: 'Driver pick your package', readyToPickup: true } }).exec();

      // Respond with success message
      res.status(200).json({ message: 'Cabinet closed and parcel status updated successfully' });
    } else {
      // If no locker with the same opening code is found
      res.status(404).json({ message: 'Locker not found' });
    }
  } catch (error) {
    console.error('Error closing locker:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



/////////////////// Driver 

// Define the endpoint to get free lockers by location
app.get('/api/free-lockers', async (req, res) => {
  try {
    const { location } = req.query;

    // Validate location
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Predefined lockers for each location
    const locationLockers = {
      'Location1': ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15'],
      'Location2': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15'],
      'Location3': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15'],
      'Location4': ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15'],
      'Location5': ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15']
    };

    // Get all lockers for the specified location
    const predefinedLockers = locationLockers[location] || [];

    // Find all occupied lockers for the specified location
    const occupiedLockers = await Locker.find({ location, lockerId: { $in: predefinedLockers } }).exec();

    // Extract the locker IDs of occupied lockers
    const occupiedLockerIds = occupiedLockers.map(locker => locker.lockerId);

    // Filter out the occupied lockers from the predefined lockers
    const freeLockers = predefinedLockers.filter(lockerId => !occupiedLockerIds.includes(lockerId));

    // Respond with the list of free lockers
    res.status(200).json({ freeLockers });
  } catch (error) {
    console.error('Error fetching free lockers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






























































app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});








