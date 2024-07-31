// schema/Shipment.js
import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  parcelWidth: String,
  parcelHeight: String,
  parcelDepth: String,
  recipientName: String,
  recipientAddress: String,
  recipientMobileNumber: String,
  senderName: String,
  senderAddress: String,
  senderPhoneNumber: String,
  senderEmail: String,
  parcelId: { type: String, unique: true } // Add parcelId field
}, { timestamps: true, collection: 'shipment' });

const Shipment = mongoose.model('Shipment', shipmentSchema);

export { Shipment };
