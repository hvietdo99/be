import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@modules/database/schemas/user.schema';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { JwtStrategyHelper } from '@modules/auth/helpers/jwt-strategy.helper';
import { JwtModule } from '@nestjs/jwt';
import { SettingService } from '@modules/customer/setting/setting.service';
import { Setting, SettingSchema } from '@modules/database/schemas/setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Setting.name, schema: SettingSchema },
    ]),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategyHelper, SettingService],
  exports: [AuthService],
})
export class AuthModule {}
