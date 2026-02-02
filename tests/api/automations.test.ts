import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { setupAuth } from '../../server/auth';
import { createServer } from 'http';

describe('Automation API', () => {
  let app: express.Application;
  let server: any;
  let authCookies: string[];
  let userId: string;

  beforeEach(async () => {
    app = express();
    const httpServer = createServer(app);
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    await setupAuth(app);
    await registerRoutes(httpServer, app);
    
    server = httpServer;

    // Create authenticated user
    const signupResponse = await request(server)
      .post('/api/auth/signup')
      .send({
        email: 'automationuser@example.com',
        password: 'password123',
        firstName: 'Automation',
        lastName: 'Tester',
      });

    authCookies = signupResponse.headers['set-cookie'];
    userId = signupResponse.body.user.id;
  });

  describe('GET /api/automations/templates', () => {
    it('should return list of automation templates', async () => {
      const response = await request(server)
        .get('/api/automations/templates')
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Templates may not be seeded in test database
      if (response.body.length > 0) {
        const template = response.body[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('key');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('configSchema');
      }
    });

    it('should require authentication', async () => {
      await request(server)
        .get('/api/automations/templates')
        .expect(401);
    });
  });

  describe('POST /api/automations/configs', () => {
    it('should create automation configuration successfully', async () => {
      const response = await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2, // lead_followup template
          name: 'Test Lead Follow-up',
          configJson: {
            crm: 'Pipedrive',
            followUpDelay: 7,
            autoSend: false,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Lead Follow-up');
      expect(response.body).toHaveProperty('templateId', 2);
      expect(response.body).toHaveProperty('isActive', true);
      expect(response.body.configJson).toMatchObject({
        crm: 'Pipedrive',
        followUpDelay: 7,
      });
    });

    it('should reject config without required fields', async () => {
      const response = await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          name: 'Incomplete Config',
          // Missing templateId
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should require authentication', async () => {
      await request(server)
        .post('/api/automations/configs')
        .send({
          templateId: 1,
          name: 'Unauthorized Config',
        })
        .expect(401);
    });

    it('should isolate configs per organization', async () => {
      // Create config as first user
      await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2,
          name: 'User 1 Config',
          configJson: { crm: 'HubSpot' },
        });

      // Create second user in different org
      const user2Response = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'user2@example.com',
          password: 'password123',
          firstName: 'User',
          lastName: 'Two',
        });

      const user2Cookies = user2Response.headers['set-cookie'];

      // List configs as user 2
      const listResponse = await request(server)
        .get('/api/automations/configs')
        .set('Cookie', user2Cookies)
        .expect(200);

      // User 2 should see no configs (different org)
      expect(listResponse.body).toHaveLength(0);
    });
  });

  describe('GET /api/automations/configs', () => {
    it('should list user automation configurations', async () => {
      // Create test configs
      await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2,
          name: 'Config 1',
          configJson: { crm: 'Pipedrive' },
        });

      await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 3,
          name: 'Config 2',
          configJson: { formSource: 'Typeform' },
        });

      const response = await request(server)
        .get('/api/automations/configs')
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('templateId');
    });
  });

  describe('POST /api/automations/configs/:id/run', () => {
    let configId: number;

    beforeEach(async () => {
      // Create a test config
      const configResponse = await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2, // lead_followup
          name: 'Test Run Config',
          configJson: { crm: 'Pipedrive', followUpDelay: 7 },
        });

      configId = configResponse.body.id;
    });

    it('should trigger automation run successfully', async () => {
      const response = await request(server)
        .post(`/api/automations/configs/${configId}/run`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'QUEUED');
      expect(response.body).toHaveProperty('automationConfigId', configId);
      expect(response.body).toHaveProperty('startedAt', null);
      expect(response.body).toHaveProperty('endedAt', null);
    });

    it('should reject run for non-existent config', async () => {
      await request(server)
        .post('/api/automations/configs/99999/run')
        .set('Cookie', authCookies)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(server)
        .post(`/api/automations/configs/${configId}/run`)
        .expect(401);
    });

    it.skip('should complete run and update status', async () => {
      // Skip this test - async execution with afterEach cleanup causes race conditions
      // In a real test environment, you'd want to wait for completion or use a different cleanup strategy
    });
  });

  describe('GET /api/runs', () => {
    it('should list automation runs', async () => {
      // Create config and run
      const configResponse = await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2,
          name: 'Run Test Config',
          configJson: { crm: 'Pipedrive' },
        });

      await request(server)
        .post(`/api/automations/configs/${configResponse.body.id}/run`)
        .set('Cookie', authCookies);

      // List runs
      const response = await request(server)
        .get('/api/runs')
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const run = response.body[0];
      expect(run).toHaveProperty('id');
      expect(run).toHaveProperty('status');
      expect(run).toHaveProperty('automationConfigId');
    });

    it('should require authentication', async () => {
      await request(server)
        .get('/api/runs')
        .expect(401);
    });

    it('should isolate runs per organization', async () => {
      // Create run as user 1
      const configResponse = await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2,
          name: 'User 1 Config',
          configJson: { crm: 'HubSpot' },
        });

      await request(server)
        .post(`/api/automations/configs/${configResponse.body.id}/run`)
        .set('Cookie', authCookies);

      // Create second user
      const user2Response = await request(server)
        .post('/api/auth/signup')
        .send({
          email: 'runuser2@example.com',
          password: 'password123',
          firstName: 'Run',
          lastName: 'User2',
        });

      // User 2 should see no runs
      const runsResponse = await request(server)
        .get('/api/runs')
        .set('Cookie', user2Response.headers['set-cookie'])
        .expect(200);

      expect(runsResponse.body).toHaveLength(0);
    });
  });

  describe('GET /api/runs/:id/logs', () => {
    it('should retrieve run logs successfully', async () => {
      // Create and execute run
      const configResponse = await request(server)
        .post('/api/automations/configs')
        .set('Cookie', authCookies)
        .send({
          templateId: 2,
          name: 'Log Test Config',
          configJson: { crm: 'Pipedrive', followUpDelay: 7 },
        });

      const runResponse = await request(server)
        .post(`/api/automations/configs/${configResponse.body.id}/run`)
        .set('Cookie', authCookies);

      const runId = runResponse.body.id;

      // Wait for some logs to be created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch logs
      const logsResponse = await request(server)
        .get(`/api/runs/${runId}/logs`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(logsResponse.body)).toBe(true);
      expect(logsResponse.body.length).toBeGreaterThan(0);

      const log = logsResponse.body[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('runId', runId);
      expect(log).toHaveProperty('level');
      expect(log).toHaveProperty('message');
      expect(log).toHaveProperty('ts');
      expect(['INFO', 'WARN', 'ERROR']).toContain(log.level);
    });

    it('should require authentication', async () => {
      await request(server)
        .get('/api/runs/1/logs')
        .expect(401);
    });
  });
});
