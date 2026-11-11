import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request = require('supertest');
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { TicketSeeder } from './modules/ticket/infrastructure/ticket-seeder';

describe('Public OpenAPI document', () => {
  it('publishes every route with request, response, filter, and error schemas', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(TicketSeeder).useValue({})
      .compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Support Ticket API').setVersion('1.0').build());
    SwaggerModule.setup('api/docs', app, document);
    await app.init();
    try {
      const { body } = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
      const paths = body.paths;
      expect(Object.keys(paths).sort()).toEqual([
        '/api/v1/notifications', '/api/v1/tickets', '/api/v1/tickets/{id}',
        '/api/v1/tickets/{id}/status', '/health',
      ]);
      expect(Object.keys(paths['/api/v1/tickets']).sort()).toEqual(['get', 'post']);
      expect(paths['/api/v1/tickets'].post.requestBody.content['application/json'].schema.$ref)
        .toBe('#/components/schemas/CreateTicketDto');
      expect(paths['/api/v1/tickets'].post.responses['201'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/TicketResponseDto');
      expect(paths['/api/v1/tickets'].get.parameters.map((param: { name: string }) => param.name).sort())
        .toEqual(['category', 'limit', 'page', 'status']);
      expect(paths['/api/v1/tickets'].get.parameters.find((param: { name: string }) => param.name === 'limit').schema.maximum)
        .toBe(100);
      expect(paths['/api/v1/tickets'].get.responses['200'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/TicketListResponseDto');
      expect(paths['/api/v1/tickets'].get.responses['400'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/ErrorEnvelopeDto');
      expect(paths['/api/v1/tickets/{id}'].get.responses['404'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/ErrorEnvelopeDto');
      const patch = paths['/api/v1/tickets/{id}/status'].patch;
      expect(patch.requestBody.content['application/json'].schema.$ref).toBe('#/components/schemas/StatusUpdateDto');
      expect(Object.keys(patch.responses).sort()).toEqual(['200', '400', '404', '409', '500']);
      expect(patch.responses['409'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/ErrorEnvelopeDto');
      expect(paths['/api/v1/notifications'].get.parameters.map((param: { name: string }) => param.name).sort())
        .toEqual(['limit', 'page']);
      const notificationLimit = paths['/api/v1/notifications'].get.parameters
        .find((param: { name: string }) => param.name === 'limit');
      expect(notificationLimit.schema).toMatchObject({ maximum: 100, example: 5 });
      expect(paths['/api/v1/notifications'].get.responses['200'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/NotificationListResponseDto');
      expect(body.components.schemas.NotificationListResponseDto.properties.pagination.$ref)
        .toBe('#/components/schemas/PaginationResponseDto');
      expect(paths['/api/v1/notifications'].get.responses['400'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/ErrorEnvelopeDto');
      expect(paths['/health'].get.responses['200'].content['application/json'].schema.$ref)
        .toBe('#/components/schemas/HealthResponseDto');
      expect(body.components.schemas.TicketResponseDto.properties.assignedTeamCode.enum)
        .toEqual(['INCIDENT_TEAM', 'ENGINEERING_TEAM', 'FINANCE_TEAM', 'SUPPORT_TEAM']);
      expect(body.components.schemas.StatusUpdateDto.properties.status.enum)
        .toEqual(['OPEN', 'IN_PROGRESS', 'RESOLVED']);
      expect(body.components.schemas.ErrorEnvelopeDto.properties.error.$ref)
        .toBe('#/components/schemas/ErrorDetailDto');
    } finally {
      await app.close();
    }
  });
});
