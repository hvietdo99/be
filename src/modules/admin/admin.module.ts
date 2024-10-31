import { Module } from '@nestjs/common';
import { UserModule } from '@modules/admin/user/user.module';
import { AssetModule } from '@modules/admin/asset/asset.module';
import { SettingModule } from '@modules/admin/setting/setting.module';
import { WalletModule } from '@modules/admin/wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, AssetModule, SettingModule, WalletModule, AuthModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AdminModule {}
