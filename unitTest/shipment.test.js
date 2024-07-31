import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../app'; // Adjust path to your Express app

describe('Shipment Endpoints', function() {
    before(async function() {
        await mongoose.connect('mongodb://localhost:27017/test_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Clean up the database before tests
        await Shipment.deleteMany({});
        await Tracking.deleteMany({});
        await Locker.deleteMany({});
    });

    after(async function() {
        // Clean up the database after tests
        await Shipment.deleteMany({});
        await Tracking.deleteMany({});
        await Locker.deleteMany({});
        await mongoose.connection.close();
    });

    it('should create a new shipment', async function() {
        const response = await request(app)
            .post('/api/shipment')
            .send({
                parcelWidth: '10',
                parcelHeight: '10',
                parcelDepth: '10',
                recipientName: 'John Doe',
                recipientAddress: '123 Test St',
                recipientMobileNumber: '555-1234',
                senderName: 'Jane Smith',
                senderAddress: '456 Example Ave',
                senderPhoneNumber: '555-5678',
                senderEmail: 'sender@example.com',
                recipientEmail: 'recipient@example.com',
                location: 'Location1'
            })
            .expect(201);

        expect(response.body.message).to.equal('Shipment created successfully');
        expect(response.body).to.have.property('parcelId');
        expect(response.body).to.have.property('lockerId');
        expect(response.body).to.have.property('lockerOpenCode');
    });
});
