import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { seedProducts } from './infrastructure/persistence/typeorm/seeds/product.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  await seedProducts(dataSource);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // lanza error si envían propiedades extra
      transform: true, // convierte tipos automáticamente (ej: string → number)
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription(
      'API REST para sistema de e-commerce con integración de pagos Wompi',
    )
    .setVersion('1.0')
    .addTag('Products', 'Endpoints para gestión de productos')
    .addTag('Transactions', 'Endpoints para gestión de transacciones y pagos')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.example.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'E-Commerce API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  app.enableCors();
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
