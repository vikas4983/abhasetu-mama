import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable CORS for frontend requests
  app.enableCors({
    origin: '*', // In production, replace with specific frontend origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Unified routing prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Abha Setu High-Performance NestJS Backend running on port ${port}`);
}
bootstrap();
