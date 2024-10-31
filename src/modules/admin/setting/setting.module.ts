import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import {
  VolumeSetting,
  VolumeSettingSchema,
} from '@modules/database/schemas/volume-setting.schema';
import { SettingController } from '@modules/admin/setting/setting.controller';
import { SettingService } from '@modules/admin/setting/setting.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VolumeSetting.name, schema: VolumeSettingSchema },
    ]),
    JwtModule,
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
