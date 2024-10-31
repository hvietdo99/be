import { MasterWalletDocument } from '@modules/database/schemas/master-wallet.schema';
import { Network } from '@src/modules/database/schemas/user.schema';

export class FindMasterWalletResponseDto {
  _id: string;
  addresses: {
    [Network.BEP20]: string;
    [Network.ERC20]: string;
    [Network.TRC20]: string;
  };
  balance: Map<Network, number>;

  constructor(props: MasterWalletDocument) {
    this._id = props._id.toString();
    this.addresses = props.addresses;
    this.balance = props.balance;
  }
}
