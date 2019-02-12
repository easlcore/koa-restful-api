const request = require('supertest');
const mongoose = require('mongoose');
const http = require('http');
const { app } = require('../app');

let server;

beforeAll(async () => {
    server = http.createServer(app.callback());
    server.listen();

    global.user = {
        email: 'test@test.com',
        password: 'testpassword'
    };

    global.product = {
        name: 'some product name',
        description: 'some product description'
    };

    const db = mongoose.connection;
    await db.dropDatabase();
});

afterAll(() => {
    mongoose.disconnect();
    server.close();

    delete global.user;
    delete global.product;
});

describe('routes: index', () => {
    it('should respond success message', async () => {
        const response = await request(server).get('/');
        expect(response.status).toEqual(200);
        expect(response.body.message).toBeDefined();
        expect(response.body.message).toEqual('Success');
    });
});

describe('routes: /products', () => {
    it('should respond json from GET request', async () => {
        const response = await request(server).get('/api/v1/products');
        expect(response.status).toEqual(200);
        expect(response.type).toEqual('application/json');
        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('items');
        expect(response.body).toHaveProperty('amount');
        expect(response.body).toEqual(
            expect.arrayContaining([])
        );
    });

    it('should fail to post product without login', async () => {
        const response = await request(server)
            .post('/api/v1/products')
            .set('Accept', 'application/json')
            .send(global.product);

        expect(response.status).toEqual(401);
        expect(response.type).toEqual('application/json');
        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('message', 'Auth failed');
    });
});

describe('routes: /signup', () => {
    it('should respond json from post signup request', async () => {
        const response = await request(server)
            .post('/api/v1/signup')
            .set('Accept', 'application/json')
            .send(global.user);

        expect(response.status).toEqual(200);
        expect(response.type).toEqual('application/json');
        expect(response.body).toBeDefined();
    });
});