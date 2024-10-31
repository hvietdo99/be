import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from '@modules/customer/transaction/transaction.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private logger = new Logger('TransactionCronService');

  constructor(private readonly transactionService: TransactionService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async collectToMasterWallet() {
    this.logger.debug('Collect to master wallet cronjob is processing');
    return await this.transactionService.collectToMasterWallet();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async scheduleScanDepositTxs() {
    this.logger.debug('Schedule scan deposit txs cronjob is processing');
    return await this.transactionService.scheduleScanDepositTxs();
  }
}
