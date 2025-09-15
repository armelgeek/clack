import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
const cookieParser = require('cookie-parser');
import { Request, Response } from 'express';
import { auth } from './modules/auth/auth.service';
import { scalarPage } from './common/templates/scalar';
import { homePage } from './common/templates/home';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use('/api/auth/*', async (req: any, res: Response) => {
    try {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;
      
        let rawBody = undefined;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          rawBody = await new Promise((resolve, reject) => {
            let data = [];
            req.on('data', chunk => data.push(chunk));
            req.on('end', () => resolve(Buffer.concat(data)));
            req.on('error', reject);
          });
        }

        const request = new Request(fullUrl, {
          method: req.method,
          headers: req.headers,
          body: rawBody,
        });

      const response = await auth.handler(request);

      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      res.status(response.status);

      if (response.body) {
        const body = await response.text();
        res.send(body);
      } else {
        res.end();
      }
    } catch (error) {
      console.error('Better Auth error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('ClickNVape - API Documentation')
    .setDescription(
      'API documentation for ClickNVape application built with NestJS',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use('/api-json', (req: Request, res: Response) => {
    res.json(document);
  });

  app.use('/docs', (req: Request, res: Response) => {
    res.send(`${scalarPage}`);
  });

  app.use('/', async (req: Request, res: Response) => {
    res.send(`${homePage}`);
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Standard Swagger UI: http://localhost:${port}/docs`);
  console.log(`🔐 Better Auth Docs: http://localhost:${port}/api/auth/reference`);
}

bootstrap();
