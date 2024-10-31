import {
  TransactionDocument,
  TransactionStatus,
} from '@modules/database/schemas/transaction.schema';

export class GetTransactionDetailResponseDto {
  _id: string;
  fromAddress: string;
  toAddress: string;
  price: number;
  closedPrice: number;
  amount: number;
  network: string;
  paymentMethod: string;
  tx: string;
  type: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: TransactionDocument) {
    this._id = props._id.toString();
    this.fromAddress = props.fromAddress;
    this.toAddress = props.toAddress || null;
    this.price = props.price;
    this.closedPrice = props.closedPrice || null;
    this.amount = props.amount;
    this.network = props.network;
    this.paymentMethod = props.paymentMethod;
    this.tx = props.tx;
    this.type = props.type;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
