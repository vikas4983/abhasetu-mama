import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/abdm');

  const config = new DocumentBuilder()
    .setTitle('ABHA Setu - ABDM API Bridge')
    .setDescription(
      'ABDM Sandbox Compliance API Bridge. Standardizes patient identification across healthcare providers. ' +
      'API Security: Requires Authorization Token (format: Bearer {Token_Value}) and X-HIP-ID headers. ' +
      'Version 3 features RSA encryption (RSA/ECB/PKCS1Padding) using public certificates from the gateway.'
    )
    .setVersion('3.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Format: Bearer {Token_Value}'
    })
    .addApiKey({
      type: 'apiKey',
      name: 'X-HIP-ID',
      in: 'header',
      description: 'ABDM X-HIP-ID required header key'
    }, 'X-HIP-ID')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/abdm/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

