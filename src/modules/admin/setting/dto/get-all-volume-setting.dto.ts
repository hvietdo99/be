import { PageRequestDto } from '@common/classes/request.dto';
import { VolumeSettingDocument } from '@modules/database/schemas/volume-setting.schema';

export class GetAllVolumeSettingDto extends PageRequestDto {}

export class GetAllVolumeSettingResponseDto {
  _id: string;
  name: string;
  tier: number;
  fee: number;
  minVolume: number;
  minRevenue: number;
  minFnstBalance: number;
  fnstHoldingValue: number;
  minFeeAndFnstHolding: number;
  minRevenueAndFnstHolding: number;

  constructor(props: VolumeSettingDocument) {
    this._id = props._id.toString();
    this.name = props.name;
    this.tier = props.tier;
    this.fee = props.fee;
    this.minVolume = props.minVolume;
    this.minRevenue = props.minRevenue;
    this.minFnstBalance = props.minFnstBalance;
    this.fnstHoldingValue = props.fnstHoldingValue;
    this.minFeeAndFnstHolding = props.minFeeAndFnstHolding;
    this.minRevenueAndFnstHolding = props.minRevenueAndFnstHolding;
  }
}
