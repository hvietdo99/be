import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import {
  Transaction,
  TransactionSchema,
} from '@modules/database/schemas/transaction.schema';
import { TransactionController } from '@modules/customer/transaction/transaction.controller';
import { TransactionService } from '@modules/customer/transaction/transaction.service';
import { AssetModule } from '@modules/customer/asset/asset.module';
import { UserModule } from '@src/modules/admin/user/user.module';
import { User, UserSchema } from '@src/modules/database/schemas/user.schema';
import { Block, BlockSchema } from '@src/modules/database/schemas/block.schema';
import { Config, ConfigSchema } from '@src/modules/database/schemas/config.schema';
import { CronService } from '@modules/customer/transaction/cron.service';
import {
  MasterWallet,
  MasterWalletSchema,
} from '@modules/database/schemas/master-wallet.schema';
import { AuthModule } from '@src/modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Block.name, schema: BlockSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: MasterWallet.name, schema: MasterWalletSchema },
    ]),
    JwtModule,
    AssetModule,
    UserModule,
    AuthModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, CronService],
  exports: [TransactionService, CronService],
})
export class TransactionModule {}
