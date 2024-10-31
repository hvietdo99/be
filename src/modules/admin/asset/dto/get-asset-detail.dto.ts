import { AssetStatus } from '@modules/database/schemas/asset.schema';

export class GetAssetDetailResponseDto {
  _id: string;
  address: string;
  creator: string;
  currency: string;
  currencyLogo: string;
  mainCurrency: string;
  network: string;
  networkLogo: string;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: any) {
    this._id = props._id.toString();
    this.address = props.address;
    this.creator = props.creator?.name || null;
    this.currency = props.currency;
    this.currencyLogo = props.currencyLogo;
    this.mainCurrency = props.mainCurrency;
    this.network = props.network;
    this.networkLogo = props.networkLogo;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
