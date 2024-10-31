import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from '@modules/database/database.module';
import { Config } from '@config/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@modules/auth/auth.module';
import { AdminModule } from '@modules/admin/admin.module';
import { CustomerModule } from '@modules/customer/customer.module';
import { ApiLoggerMiddleware } from '@middlewares/logger.middleware';
import { WinstonLoggerService } from '@common/services/winston.service';
import { CronjobModule } from '@modules/cronjob/cronjob.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: Config.JWT_SECRET,
      signOptions: { expiresIn: '120s' },
    }),
    AuthModule,
    AdminModule,
    CustomerModule,
    DatabaseModule,
    CronjobModule,
  ],
  controllers: [AppController],
  providers: [WinstonLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}
