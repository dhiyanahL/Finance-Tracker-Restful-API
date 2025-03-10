import request from 'supertest';
import server from '../../server.js'; // This is where your Express app is initialized
import mongoose from 'mongoose';

describe('Transaction API Integration Tests', () => {
    let token;

    beforeAll(async () => {
        // Connect to MongoDB using the URI directly
        const mongoUri = 'mongodb+srv://dheeliyaudeen:XeCFVKv62uohDYnj@cluster0.duf4f.mongodb.net/finances?retryWrites=true&w=majority&appName=Cluster0';
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Assuming you have a user login API to get a token for authorization
        // Replace with actual login API route and payload
        const response = await request(server)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com', // Replace with actual test user credentials
                password: 'password123', // Replace with actual password
            });

        token = response.body.token;
    });

    afterAll(async () => {
        // Disconnect from the database after all tests are done
        await mongoose.connection.close();
    });

    test('POST /api/transactions should create a new transaction', async () => {
        const transactionData = {
            type: 'expense',
            amount: 500,
            category: 'Groceries',
            date: '2025-02-27',
            recurring: true,
            recurrencePattern: 'weekly',
            currency: 'LKR',
        };

        const response = await request(server)
            .post('/api/transactions') // Endpoint to create a transaction
            .set('Authorization', `Bearer ${token}`) // Assuming JWT token is used
            .send(transactionData);

        expect(response.status).toBe(201); // Expect HTTP status 201 (Created)
        expect(response.body).toHaveProperty('_id');
        expect(response.body.type).toBe(transactionData.type);
        expect(response.body.amount).toBe(transactionData.amount);
        expect(response.body.category).toBe(transactionData.category);
    });

    test('GET /api/transactions should return a list of transactions', async () => {
        const response = await request(server)
            .get('/api/transactions') // Endpoint to get the transactions
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.transactions)).toBe(true);
    });

    test('POST /api/transactions should return an error for missing required fields', async () => {
        const invalidTransactionData = {
            amount: 500,
            category: 'Groceries',
            // Missing 'type' field
        };

        const response = await request(server)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidTransactionData);

        expect(response.status).toBe(400); // Expect HTTP status 400 (Bad Request)
        expect(response.body.message).toBe('Please provide type, amount and category');
    });

    test('POST /api/transactions should handle server error gracefully', async () => {
        // Simulate server error (e.g., database connection issue)
        const response = await request(server)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 'expense',
                amount: 400,
                category: 'Groceries',
                date: '2025-02-27',
                recurring: true,
                recurrencePattern: 'weekly',
                currency: 'LKR',
            });

        expect(response.status).toBe(500); // Internal Server Error
        expect(response.body.message).toBe('Server error occurred');
    });
});
