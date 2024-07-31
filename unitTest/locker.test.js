import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../app'; // Adjust path to your Express app

describe('Locker Endpoints', function() {
    before(async function() {
        await mongoose.connect('mongodb://localhost:27017/test_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Clean up the database before tests
        await Locker.deleteMany({});
    });

    after(async function() {
        // Clean up the database after tests
        await Locker.deleteMany({});
        await mongoose.connection.close();
    });

    it('should check locker code', async function() {
        // First, create a locker with a known code
        const locker = new Locker({
            parcelId: '1234',
            lockerId: 'A1',
            location: 'Location1',
            lockerOpenCode: '1234'
        });
        await locker.save();

        const response = await request(app)
            .post('/api/check-locker-code')
            .send({
                location: 'Location1',
                openingCode: '1234'
            })
            .expect(200);

        expect(response.body.message).to.equal('DOOR');
        expect(response.body).to.have.property('lockerId', 'A1');
        expect(response.body).to.have.property('parcelId', '1234');
    });

    it('should close a locker', async function() {
        // First, create a locker with a known code
        const locker = new Locker({
            parcelId: '1234',
            lockerId: 'A1',
            location: 'Location1',
            lockerOpenCode: '1234'
        });
        await locker.save();

        // Create a tracking record
        const tracking = new Tracking({
            senderEmail: 'sender@example.com',
            receiverEmail: 'recipient@example.com',
            status: 'Not Enabled',
            parcelId: '1234',
            retrieveCode: '1234',
            readyToPickup: false
        });
        await tracking.save();

        const response = await request(app)
            .post('/api/close-locker')
            .send({
                location: 'Location1',
                openingCode: '1234',
                parcelId: '1234'
            })
            .expect(200);

        expect(response.body.message).to.equal('Cabinet closed and parcel status updated successfully');

        // Check if locker status is updated
        const updatedLocker = await Locker.findOne({ lockerId: 'A1' });
        expect(updatedLocker.opened).to.be.false;

        // Check if tracking status is updated
        const updatedTracking = await Tracking.findOne({ parcelId: '1234' });
        expect(updatedTracking.status).to.equal('Driver pick your package');
        expect(updatedTracking.readyToPickup).to.be.true;
    });
});
