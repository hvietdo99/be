import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@modules/database/schemas/user.schema';
import { UsersController } from '@modules/admin/user/user.controller';
import { UserService } from '@modules/admin/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@modules/auth/auth.module';
import { SettingModule } from '@modules/customer/setting/setting.module';
import {
  MasterWallet,
  MasterWalletSchema,
} from '@src/modules/database/schemas/master-wallet.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: MasterWallet.name, schema: MasterWalletSchema },
    ]),
    ConfigModule,
    JwtModule,
    AuthModule,
    SettingModule,
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
