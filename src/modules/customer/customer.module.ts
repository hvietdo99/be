import { Module } from '@nestjs/common';
import { WalletModule } from '@modules/customer/wallet/wallet.module';
import { AssetModule } from '@modules/customer/asset/asset.module';
import { SettingModule } from '@modules/customer/setting/setting.module';
import { TransactionModule } from '@modules/customer/transaction/transaction.module';
import { UserModule } from '@modules/customer/user/user.module';

@Module({
  imports: [UserModule, WalletModule, AssetModule, SettingModule, TransactionModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CustomerModule {}
