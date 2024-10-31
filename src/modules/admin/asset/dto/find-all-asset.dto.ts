import { RangeDateRequestDto } from '@common/classes/request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetStatus } from '@modules/database/schemas/asset.schema';

export class FindAllAssetDto extends RangeDateRequestDto {
  @ApiProperty({ type: AssetStatus, required: false, enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  status: AssetStatus;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  creatorId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  search: string;
}

export class FindAllAssetResponseDto {
  _id: string;
  address: string;
  creator: string;
  createdAt: Date;
  status: AssetStatus;
  currency: string;
  mainCurrency: string;
  network: string;

  constructor(props: any) {
    this._id = props._id.toString();
    this.address = props.address;
    this.creator = props.creator?.name || null;
    this.createdAt = props.createdAt;
    this.status = props.status;
    this.currency = props.currency;
    this.mainCurrency = props.mainCurrency;
    this.network = props.network;
  }
}
