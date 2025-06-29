const request = require('supertest');
const { createServer } = require('../src/server');

describe('Albums API', () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('POST /albums', () => {
    it('should create a new album', async () => {
      const payload = {
        name: 'Test Album',
        year: 2023,
      };

      const response = await request(server.listener)
        .post('/albums')
        .send(payload)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.albumId).toBeDefined();
    });

    it('should return 400 for invalid payload', async () => {
      const payload = {
        name: 'Test Album',
        // missing year
      };

      const response = await request(server.listener)
        .post('/albums')
        .send(payload)
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });
});