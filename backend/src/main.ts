import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const frontendUrl = process.env.FRONTEND_URL;
  let corsOrigin: string = 'http://localhost:5173';
  if (frontendUrl) {
    try {
      corsOrigin = new URL(frontendUrl).origin;
    } catch {
      corsOrigin = frontendUrl;
    }
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
