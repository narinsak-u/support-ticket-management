import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { TicketSeeder } from './modules/ticket/infrastructure/ticket-seeder';
import { configureCors } from './common/configure-cors';

describe('frontend origin CORS policy', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(TicketSeeder).useValue({})
      .compile();
    app = module.createNestApplication();
    configureCors(app, 'http://localhost:5173,http://127.0.0.1:5173');
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(['http://localhost:5173', 'http://127.0.0.1:5173'])('allows configured origin %s', async (origin) => {
    await request(app.getHttpServer()).options('/health')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'GET')
      .expect('Access-Control-Allow-Origin', origin)
      .expect(204);
  });

  it('does not grant an unconfigured origin cross-origin access', async () => {
    const response = await request(app.getHttpServer()).options('/health')
      .set('Origin', 'https://attacker.example')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
