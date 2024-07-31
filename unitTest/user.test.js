import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../app'; // Adjust path to your Express app

describe('User Endpoints', function() {
    let testEmail = 'testuser@example.com';
    let testPassword = 'Test@1234';

    before(async function() {
        await mongoose.connect('mongodb://localhost:27017/test_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Clean up the database before tests
        await User.deleteMany({});
    });

    after(async function() {
        // Clean up the database after tests
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    it('should sign up a new user', async function() {
        const response = await request(app)
            .post('/api/signup')
            .send({
                userName: 'Test User',
                email: testEmail,
                password: testPassword
            })
            .expect(201);

        expect(response.body.message).to.equal('User registered successfully');
    });

    it('should fetch user data by email', async function() {
        // First create a user
        await request(app)
            .post('/api/signup')
            .send({
                userName: 'Test User',
                email: testEmail,
                password: testPassword
            });

        const response = await request(app)
            .get(`/api/userData/${testEmail}`)
            .expect(200);

        expect(response.body).to.be.an('array').that.is.not.empty;
    });
});
