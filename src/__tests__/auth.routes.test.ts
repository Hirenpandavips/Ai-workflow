import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import * as authService from '../services/auth.service';

jest.mock('../services/auth.service');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const mockResponse = {
  token: 'mock.jwt.token',
  user: { id: 'uuid-1', email: 'test@example.com', name: 'Test' },
};

describe('POST /api/auth/register', () => {
  it('should return 201 with token on success', async () => {
    (authService.register as jest.Mock).mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should return 400 if registration fails', async () => {
    (authService.register as jest.Mock).mockRejectedValue(
      new Error('Email already in use'),
    );

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already in use');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email format');
  });

  it('should return 400 for password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password must be at least 8 characters');
  });
});

describe('POST /api/auth/login', () => {
  it('should return 200 with token on success', async () => {
    (authService.login as jest.Mock).mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should return 401 on bad credentials', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials'),
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});