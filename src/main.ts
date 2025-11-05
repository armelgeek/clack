import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
const cookieParser = require('cookie-parser');
import { Response } from 'express';
import { auth } from './modules/auth/auth.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SocketIoAdapter } from './common/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // register global filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Redirect root and favicon to docs
  app.use('/', (req: any, res: Response, next: any) => {
    if (req.path === '/' || req.path === '/favicon.ico') {
      return res.redirect('/docs');
    }
    next();
  });

  app.use('/api/auth/*', async (req: any, res: Response) => {
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] ||
        'Content-Type,Authorization',
    );

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      let rawBody = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        rawBody = await new Promise((resolve, reject) => {
          let data = [];
          req.on('data', (chunk) => data.push(chunk));
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

      // Forward cookies from Better Auth to the client
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        setCookie
          .split(',')
          .forEach((c: string) => res.append('Set-Cookie', c));
      }

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') {
          res.setHeader(key, value);
        }
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

  app.useWebSocketAdapter(new SocketIoAdapter(app));

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
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation (Scalar): http://localhost:${port}/docs`);
  console.log(
    `🔐 Better Auth Docs: http://localhost:${port}/api/auth/reference`,
  );
}

bootstrap();
