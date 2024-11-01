import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtcController } from './otc.controller';
import { OtcService } from './otc.service';
import { OtcOrder, OtcOrderSchema } from './schemas/otc-order.schema';
import { User, UserSchema } from '@modules/database/schemas/user.schema';
import { UserModule } from '@modules/admin/user/user.module';
import { TransactionModule } from '../transaction/transaction.module';
import { OtcPriceService } from './services/price.service';
import { OtcValidationService } from './services/validation.service';
import { OtcBalanceService } from './services/balance.service';
import { OrderProcessorService } from './services/order-processor.service';
import { OtcSecurityService } from './services/security.service';
import { RateModule } from '@modules/admin/rate/rate.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtcOrder.name, schema: OtcOrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    TransactionModule,
    RateModule,
  ],
  controllers: [OtcController],
  providers: [
    OtcService,
    OtcPriceService,
    OtcValidationService,
    OtcBalanceService,
    OrderProcessorService,
    OtcSecurityService,
  ],
  exports: [OtcService],
})
export class OtcModule {}
