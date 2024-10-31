import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { ExceptionsFilter } from '@common/exceptions/http-exception.filter';
import { AppConstants } from '@common/constants/app.constants';
import { NodeEnv } from '@common/constants/node-env.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Config } from '@config/config';
import { AuthModule } from '@modules/auth/auth.module';
import { AdminModule } from '@modules/admin/admin.module';
import { CustomerModule } from '@modules/customer/customer.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: true,
    cors: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));

  /**
   * @description Global Interceptor
   */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  /**
   * @description Global Prefix
   */
  app.setGlobalPrefix(AppConstants.GLOBAL_PREFIX);

  /**
   * @description SwaggerUI
   */

  if (process.env.NODE_ENV !== NodeEnv.PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle('MonkhochirOTC API')
      .setDescription('MonkhochirOTCAPI')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const appDocument = SwaggerModule.createDocument(app, config, {
      include: [AuthModule],
    });
    SwaggerModule.setup('/docs', app, appDocument);
  }

  if (process.env.NODE_ENV !== NodeEnv.PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle('MonkhochirOTC Admin Module API')
      .setDescription('MonkhochirOTC Admin Module API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const adminDocument = SwaggerModule.createDocument(app, config, {
      include: [AuthModule, AdminModule],
      deepScanRoutes: true,
    });

    SwaggerModule.setup('/admin/docs', app, adminDocument);
  }

  if (process.env.NODE_ENV !== NodeEnv.PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle('MonkhochirOTC Customer Module API')
      .setDescription('MonkhochirOTC Customer Module API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const customerDocument = SwaggerModule.createDocument(app, config, {
      include: [AuthModule, CustomerModule],
      deepScanRoutes: true,
    });

    SwaggerModule.setup('/customer/docs', app, customerDocument);
  }

  await app.listen(Config.PORT, async () => {
    console.log('Server is listening on ' + (await app.getUrl()));
  });
}
bootstrap();
