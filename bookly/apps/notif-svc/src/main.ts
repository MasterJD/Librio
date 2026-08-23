import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8004);
  console.log('notif-svc running on http://localhost:8004');
}
bootstrap();
