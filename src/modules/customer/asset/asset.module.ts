import { Module } from '@nestjs/common';
import { AssetController } from '@modules/customer/asset/asset.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from '@modules/database/schemas/asset.schema';
import {
  Transaction,
  TransactionSchema,
} from '@modules/database/schemas/transaction.schema';
import { AssetModule as AdminAssetModule } from '@modules/admin/asset/asset.module';
import { JwtModule } from '@nestjs/jwt';
import { AssetService } from '@modules/customer/asset/asset.service';
import { WalletModule } from '@modules/customer/wallet/wallet.module';
import { UserModule } from '@modules/admin/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    AdminAssetModule,
    WalletModule,
    JwtModule,
    UserModule,
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
