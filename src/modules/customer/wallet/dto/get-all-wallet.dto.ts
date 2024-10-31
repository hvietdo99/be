import { PageRequestDto } from '@common/classes/request.dto';
import { WalletDocument, WalletType } from '@modules/database/schemas/wallet.schema';

export class GetAllWalletDto extends PageRequestDto {}

export class GetAllWalletResponseDto {
  _id: string;
  address: string;
  type: WalletType;
  createdAt: Date;

  constructor(props: WalletDocument) {
    this._id = props._id.toString();
    this.address = props.address;
    this.type = props.type;
    this.createdAt = props.createdAt;
  }
}
