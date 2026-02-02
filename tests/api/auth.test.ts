import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { setupAuth } from '../../server/auth';
import { createServer } from 'http';

describe('Authentication API', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    const httpServer = createServer(app);
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    await setupAuth(app);
    await registerRoutes(httpServer, app);
    
    server = httpServer;
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user account successfully', async () => {
      const response = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'securePassword123',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('firstName', 'John');
      expect(response.body.user).toHaveProperty('lastName', 'Doe');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject signup with missing email', async () => {
      const response = await request(server)
        .post('/api/auth/signup')
        .send({
          password: 'securePassword123',
          firstName: 'John',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email and password are required');
    });

    it('should reject signup with short password', async () => {
      const response = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'short',
          firstName: 'John',
        })
        .expect(400);

      expect(response.body.message).toContain('at least 8 characters');
    });

    it('should reject duplicate email registration', async () => {
      // Create first user
      await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'First',
        });

      // Try to create second user with same email
      const response = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'password456',
          firstName: 'Second',
        })
        .expect(400);

      expect(response.body.message).toContain('already registered');
    });

    it('should auto-create organization for new user', async () => {
      const signupResponse = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'orgtest@example.com',
          password: 'password123',
          firstName: 'Org',
          lastName: 'Test',
        });

      const cookies = signupResponse.headers['set-cookie'];

      // Verify org was created
      const orgResponse = await request(server)
        .get('/api/org')
        .set('Cookie', cookies)
        .expect(200);

      expect(orgResponse.body).toHaveProperty('id');
      expect(orgResponse.body).toHaveProperty('name');
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create test user
      await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123',
          firstName: 'Test',
          lastName: 'User',
        });
    });

    it('should authenticate valid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/signin')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('testuser@example.com');
    });

    it('should reject invalid password', async () => {
      const response = await request(server)
        .post('/api/auth/signin')
        .send({
          email: 'testuser@example.com',
          password: 'wrongPassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject non-existent user', async () => {
      const response = await request(server)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return user when authenticated', async () => {
      // Create and sign in
      const signupResponse = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'authenticated@example.com',
          password: 'password123',
          firstName: 'Auth',
          lastName: 'User',
        });

      const cookies = signupResponse.headers['set-cookie'];

      const response = await request(server)
        .get('/api/auth/user')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'authenticated@example.com');
      expect(response.body).toHaveProperty('firstName', 'Auth');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(server)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body.message).toContain('Not authenticated');
    });
  });

  describe('POST /api/logout', () => {
    it('should successfully sign out authenticated user', async () => {
      // Sign up
      const signupResponse = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'signout@example.com',
          password: 'password123',
          firstName: 'Sign',
          lastName: 'Out',
        });

      const cookies = signupResponse.headers['set-cookie'];

      // Sign out
      await request(server)
        .post('/api/logout')
        .set('Cookie', cookies)
        .expect(200);

      // Verify session destroyed
      const userResponse = await request(server)
        .get('/api/auth/user')
        .set('Cookie', cookies)
        .expect(401);

      expect(userResponse.body.message).toContain('Not authenticated');
    });
  });
});
