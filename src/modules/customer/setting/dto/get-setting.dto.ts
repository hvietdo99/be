import { Lang } from '@common/classes/response.dto';
import { SettingDocument } from '@modules/database/schemas/setting.schema';

export class GetSettingResponseDto {
  _id: string;
  currency: string;
  lang: Lang;
  verification: string;
  chargeFee: boolean;

  constructor(props: SettingDocument) {
    this._id = props._id.toString();
    this.currency = props.currency;
    this.lang = props.lang;
    this.verification = props.verification;
    this.chargeFee = props.chargeFee || false;
  }
}
