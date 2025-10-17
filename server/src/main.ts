import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS - 支持多个前端域名
  const frontendUrl = configService.get<string>('frontend.url');
  const allowedOrigins = [
    frontendUrl, // 配置的前端URL
    'http://localhost:5173', // 本地开发
    'http://localhost:3000', // 本地开发备用
  ].filter(Boolean); // 过滤掉undefined值

  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有origin的请求(比如移动应用或curl)
      if (!origin) return callback(null, true);

      // 检查origin是否在允许列表中,或者是vercel部署域名
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['health', 'health/db'],
  });

  // Start server
  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Environment: ${configService.get<string>('env')}`);
  logger.log(`Global API Prefix: /api`);
}

bootstrap();
