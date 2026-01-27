import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { webcrypto } from 'crypto';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  if (!globalThis.crypto) {
    (globalThis as any).crypto = webcrypto;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // ✅ Read PORT from .env with fallback
  const PORT = process.env.PORT || '3003';

  // ✅ Bind to all interfaces for Docker
  await app.listen(Number(PORT), '0.0.0.0');

  console.log(`Task Service running on port ${PORT}`);
}

bootstrap();
