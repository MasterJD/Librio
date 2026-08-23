import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8003);
  console.log('transaction-svc running on http://localhost:8003');
}
bootstrap();
