import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Gender,
  User,
  UserDocument,
  UserRole,
} from '@modules/database/schemas/user.schema';
import { ClientSession, FilterQuery, Model, UpdateQuery } from 'mongoose';
import {
  GetAllUsersDto,
  GetAllUsersResponseDto,
} from '@modules/admin/user/dto/get-all-user.dto';
import {
  FindAndCountResponse,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import { FindAndCountDto } from '@common/classes/request.dto';
import { GetUserDetailResponseDto } from '@modules/admin/user/dto/get-user-detail.dto';
import {
  UpdateUserDto,
  UpdateUserResponseDto,
} from '@modules/admin/user/dto/update-user.dto';
import {
  getCurrentVietnamTimeZone,
  getErrorMessage,
  toObjectId,
} from '@common/utils/utils';
import { ErrorCode } from '@common/constants/error.constants';
import { hashPassword } from '@modules/auth/helpers/password.helper';
import {
  CreateUserDto,
  CreateUserResponseDto,
} from '@modules/admin/user/dto/create-user.dto';
import { AuthService } from '@modules/auth/auth.service';
import { SettingService } from '@modules/customer/setting/setting.service';
import { AppConstants } from '@common/constants/app.constants';
import {
  MasterWallet,
  MasterWalletDocument,
  MasterWalletType,
} from '@src/modules/database/schemas/master-wallet.schema';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@src/config/config.type';
import * as bcrypt from 'bcrypt';
import { generateAddress } from '@common/utils/blockchain';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MasterWallet.name)
    private readonly masterWalletModel: Model<MasterWalletDocument>,

    private readonly configService: ConfigService<AllConfigType>,
    private readonly authService: AuthService,
    private readonly settingService: SettingService,
  ) {}

  async findAndCount(
    dto: FindAndCountDto<UserDocument>,
  ): Promise<FindAndCountResponse<UserDocument>> {
    const { condition, limit, offset, sort } = dto;
    const data = await this.userModel
      .find(condition)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec();
    const total = await this.userModel.countDocuments(condition).exec();

    return new FindAndCountResponse<UserDocument>(data, total);
  }

  async findAll(
    query: GetAllUsersDto,
  ): Promise<PaginatedResponse<GetAllUsersResponseDto>> {
    const condition: FilterQuery<User> = {
      deletedAt: null,
    };

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      condition.$or = [{ name: regex }, { email: regex }];
    }

    if (query.type) {
      condition.type = query.type;
    }

    if (query.status) {
      condition.status = query.status;
    }

    const sort = { createdAt: query.order };

    const { data, total } = await this.findAndCount({
      condition,
      limit: query.limit,
      offset: query.offset,
      sort,
    });

    return new PaginatedResponse(
      data.map((item) => new GetAllUsersResponseDto(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async findOne(id: string): Promise<GetUserDetailResponseDto> {
    const data: UserDocument = await this.userModel
      .findOne({ _id: toObjectId(id), deletedAt: null })
      .exec();
    if (!data) return null;

    return new GetUserDetailResponseDto(data);
  }

  async create(lang: Lang, dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user: UserDocument = await this.authService.validateUserByEmail(dto.email);
    if (user) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.EMAIL_HAS_BEEN_USED, lang),
      );
    }

    const hash: string = await hashPassword(dto.password);
    const keypair = generateAddress();

    const data = await this.userModel.create({
      code: this.authService.generateUserCode(),
      password: hash,
      address: keypair.address,
      prvKey: keypair.key,
      balance: 0,
      email: dto.email,
      name: dto.name,
      birthday: dto.birthday,
      gender: dto.gender,
    });

    await this.settingService.init(data._id.toString(), {
      currency: AppConstants.DEFAULT_CURRENCY,
      lang: Lang.EN,
      verification: null,
      chargeFee: false,
    });

    return new CreateUserResponseDto(data);
  }

  async update(
    id: string,
    lang: Lang,
    dto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException(getErrorMessage(ErrorCode.USER_NOT_FOUND, lang));
    }

    const updateDto: UpdateQuery<User> = {
      email: dto.email,
      name: dto.name,
      birthday: dto.birthday,
      gender: dto.gender,
      type: dto.type,
      status: dto.status,
      address: dto.address,
      prvKey: dto.prvKey,
      twoFA: dto.twoFA,
      role: dto.role,
    };

    if (dto.password) {
      updateDto.password = await hashPassword(dto.password);
    }

    const data: UserDocument = await this.userModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    return new UpdateUserResponseDto(data);
  }

  async softDelete(id: string): Promise<boolean> {
    await this.userModel
      .findByIdAndUpdate(
        id,
        { deletedAt: getCurrentVietnamTimeZone() },
        { new: true },
      )
      .exec();
    return true;
  }

  async delete(id: string, lang: Lang): Promise<boolean> {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException(getErrorMessage(ErrorCode.USER_NOT_FOUND, lang));
    }

    await this.softDelete(id);

    return true;
  }

  async generateMasterWallet() {
    const masterWallet = await this.masterWalletModel
      .findOne({ type: MasterWalletType.MASTER_WALLET })
      .lean()
      .exec();

    if (masterWallet) {
      masterWallet.prvKey = '';
      return masterWallet;
    }

    // generate new address for user
    const keypair = generateAddress();

    const newMasterWallet = await this.masterWalletModel.create({
      address: keypair.address,
      prvKey: keypair.key,
      type: MasterWalletType.MASTER_WALLET,
    });

    newMasterWallet.prvKey = '';
    return newMasterWallet;
  }

  async findMaster() {
    return await this.masterWalletModel
      .findOne({ type: MasterWalletType.MASTER_WALLET, deletedAt: null })
      .exec();
  }

  async findReserveWallet() {
    return await this.masterWalletModel
      .findOne({ type: MasterWalletType.RESERVE_WALLET, deletedAt: null })
      .exec();
  }

  async insertOwnerBalance(amount: number, session?: ClientSession): Promise<User> {
    const name = this.configService.getOrThrow('auth.owner', {
      infer: true,
    });
    const password = this.configService.getOrThrow('auth.ownerPassword', {
      infer: true,
    });

    let owner;
    owner = await this.userModel.findOneAndUpdate(
      { name },
      { $inc: { balance: amount } },
      { new: true, session },
    );

    if (!owner) {
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash(password, salt);
      owner = await this.create(Lang.EN, {
        name,
        password: hashed,
        email: 'administrator@gmail.com',
        birthday: new Date(),
        gender: Gender.OTHER,
      });
      await this.userModel.findOneAndUpdate(
        { _id: owner._id },
        { $inc: { balance: amount } },
        { new: true, session },
      );
    }
    return owner;
  }

  async getWalletAddressByUserId(id: string): Promise<string> {
    const user = await this.findOne(id);
    return user.address;
  }
}
