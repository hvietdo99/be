import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SettingService } from '@modules/customer/setting/setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from '@modules/database/schemas/setting.schema';
import { SettingController } from '@modules/customer/setting/setting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    JwtModule,
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
