import { Module } from '@nestjs/common';
import { TransactionModule } from '../customer/transaction/transaction.module';
import { CronjobService } from './cronjob.service';

@Module({
  imports: [TransactionModule],
  controllers: [],
  providers: [CronjobService],
})
export class CronjobModule {}
