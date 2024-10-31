import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@modules/database/schemas/user.schema';
import { Model } from 'mongoose';
import { GetProfileResponseDto } from '@modules/customer/user/dto/get-profile.dto';
import { CreateUserDto } from '@modules/customer/user/dto/create-user.dto';
import { getErrorMessage } from '@common/utils/utils';
import { ErrorCode } from '@common/constants/error.constants';
import { generateAddress } from '@common/utils/blockchain';
import { AppConstants } from '@common/constants/app.constants';
import { Lang } from '@common/classes/response.dto';
import { CreateUserResponseDto } from '@modules/admin/user/dto/create-user.dto';
import { AuthService } from '@modules/auth/auth.service';
import { SettingService } from '@modules/customer/setting/setting.service';
import { CreatePasswordDto } from '@modules/customer/user/dto/create-password.dto';
import { hashPassword } from '@modules/auth/helpers/password.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly authService: AuthService,
    private readonly settingService: SettingService,
  ) {}

  async getProfile(userId: string): Promise<GetProfileResponseDto> {
    const data = await this.userModel.findById(userId).lean().exec();
    if (!data) return null;

    return new GetProfileResponseDto(data);
  }

  async create(lang: Lang, dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const existed: UserDocument = await this.authService.validateUserByEmail(
      dto.email,
    );
    if (existed) {
      const data = await this.userModel
        .findByIdAndUpdate(
          existed._id,
          {
            email: dto.email,
            name: dto.name,
            birthday: dto.birthday,
            gender: dto.gender,
            avatar: dto.avatar,
          },
          { new: true, lean: true },
        )
        .lean()
        .exec();

      return new CreateUserResponseDto(data);
    }
    const keyPair = generateAddress();

    const data = await this.userModel.create({
      code: this.authService.generateUserCode(),
      password: null,
      address: keyPair.address,
      prvKey: keyPair.key,
      email: dto.email,
      name: dto.name,
      birthday: dto.birthday,
      gender: dto.gender,
      avatar: dto.avatar,
    });

    await this.settingService.init(data._id.toString(), {
      currency: AppConstants.DEFAULT_CURRENCY,
      lang: Lang.EN,
      verification: null,
      chargeFee: false,
    });

    return new CreateUserResponseDto(data);
  }

  async createPassword(lang: Lang, dto: CreatePasswordDto): Promise<boolean> {
    const user = await this.userModel.findById(dto.id).exec();
    if (!user) {
      throw new BadRequestException(getErrorMessage(ErrorCode.USER_NOT_FOUND, lang));
    }

    if (user.password) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.USER_ALREADY_HAS_PASSWORD, lang),
      );
    }

    const hash: string = await hashPassword(dto.password);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hash,
    });

    return true;
  }
}
