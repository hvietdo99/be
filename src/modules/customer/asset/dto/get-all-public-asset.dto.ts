import { RangeDateRequestDto } from '@common/classes/request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AssetStatus } from '@modules/database/schemas/asset.schema';

export class GetAllPublicAssetDto extends RangeDateRequestDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  creatorId: string;
}

export class GetAllPublicAssetResponseDto {
  _id: string;
  address: string;
  creator: string;
  createdAt: Date;
  status: AssetStatus;
  currency: string;
  mainCurrency: string;
  network: string;
  currencyLogo: string;
  networkLogo: string;

  constructor(props: any) {
    this._id = props._id.toString();
    this.address = props.address;
    this.creator = props.creator?.name || null;
    this.createdAt = props.createdAt;
    this.status = props.status;
    this.currency = props.currency;
    this.mainCurrency = props.mainCurrency;
    this.network = props.network;
    this.currencyLogo = props.currencyLogo;
    this.networkLogo = props.networkLogo;
  }
}
