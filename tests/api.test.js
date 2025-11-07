const request = require('supertest');
const app = require('../src/app');

describe('CDN Image Service API', () => {
    describe('GET /api/v1/health', () => {
        it('should return health status', async () => {
            const res = await request(app)
                .get('/api/v1/health')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('OK');
        });
    });

    describe('GET /', () => {
        it('should return welcome message', async () => {
            const res = await request(app)
                .get('/')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('CDN Image Service API');
        });
    });

    describe('POST /api/v1/images/upload', () => {
        it('should require API key', async () => {
            const res = await request(app)
                .post('/api/v1/images/upload')
                .expect(401);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/images/list', () => {
        it('should list images', async () => {
            const res = await request(app)
                .get('/api/v1/images/list')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });

    describe('404 handler', () => {
        it('should return 404 for invalid route', async () => {
            const res = await request(app)
                .get('/invalid-route')
                .expect(404);

            expect(res.body.success).toBe(false);
        });
    });
});
