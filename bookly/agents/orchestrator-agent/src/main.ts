import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, x-correlation-id, Accept, X-Requested-With',
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  });

  await app.listen(9000);
  console.log('orchestrator-agent running on http://localhost:9000');
}
bootstrap();