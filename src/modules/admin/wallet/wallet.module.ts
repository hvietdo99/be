import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import {
  MasterWallet,
  MasterWalletSchema,
} from '@modules/database/schemas/master-wallet.schema';
import { WalletController } from '@modules/admin/wallet/wallet.controller';
import { WalletService } from '@modules/admin/wallet/wallet.service';
import { AuthModule } from '@src/modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MasterWallet.name, schema: MasterWalletSchema },
    ]),
    JwtModule,
    AuthModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
