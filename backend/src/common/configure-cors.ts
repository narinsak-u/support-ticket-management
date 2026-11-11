import type { INestApplication } from '@nestjs/common';

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function configureCors(app: INestApplication, value = process.env.CORS_ORIGIN): void {
  const origins = value?.split(',').map((origin) => origin.trim()).filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : DEFAULT_ORIGINS });
}
