import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UsdtRate,
  UsdtRateSchema,
} from '@src/modules/database/schemas/usdt-rate.schema';
import { RateController } from './rate.controller';
import { RateService } from './rate.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UsdtRate.name, schema: UsdtRateSchema }]),
    JwtModule,
  ],
  controllers: [RateController],
  providers: [RateService],
  exports: [RateService],
})
export class RateModule {}
