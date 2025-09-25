import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);

  await app.register(helmet);
  await app.register(cookie, {
    secret: config.get<string>('COOKIE_SECRET') ?? 'insecure',
  });
  await app.register(cors, {
    origin: config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen({ port, host: '0.0.0.0' });
  logger.log(`API running on port ${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
