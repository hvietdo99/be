import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from '@modules/database/schemas/wallet.schema';
import { JwtModule } from '@nestjs/jwt';
import { WalletController } from '@modules/customer/wallet/wallet.controller';
import { WalletService } from '@modules/customer/wallet/wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    JwtModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
