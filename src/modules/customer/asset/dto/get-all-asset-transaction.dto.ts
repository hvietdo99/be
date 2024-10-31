import { RangeDateRequestDto } from '@common/classes/request.dto';
import {
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '@modules/database/schemas/transaction.schema';

export class GetAllAssetTransactionDto extends RangeDateRequestDto {
  assetAddress: string;
  status: TransactionStatus;
}

export class GetAllAssetTransactionResponse {
  _id: string;
  tx: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;

  constructor(props: TransactionDocument) {
    this._id = props._id.toString();
    this.tx = props.tx;
    this.fromAddress = props.fromAddress;
    this.toAddress = props.toAddress;
    this.amount = props.amount;
    this.type = props.type;
    this.status = props.status;
    this.createdAt = props.createdAt || null;
  }
}
