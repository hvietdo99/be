import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtStrategyHelper } from './helpers/jwt-strategy.helper';
import {
  AuthUserInformation,
  RegisterDto,
  RegisterResponseDto,
} from './dto/register.dto';
import { getErrorMessage, toObjectId } from '@common/utils/utils';
import {
  Network,
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '@modules/database/schemas/user.schema';
import { Lang } from '@common/classes/response.dto';
import { ErrorCode } from '@common/constants/error.constants';
import {
  comparePassword,
  hashPassword,
} from '@modules/auth/helpers/password.helper';
import { LoginDto, LoginResponseDto } from '@modules/auth/dto/login.dto';
import { ChangePasswordDto } from '@modules/auth/dto/change-password.dto';
import { ForgotPasswordDto } from '@modules/auth/dto/forgot-password.dto';
import { AppConstants } from '@common/constants/app.constants';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from '@modules/auth/dto/refresh-token.dto';
import {
  CreateAdminDto,
  CreateAdminResponseDto,
} from '@modules/auth/dto/create-admin.dto';
import { SettingService } from '@modules/customer/setting/setting.service';
import { generateAddress } from '@common/utils/blockchain';
import { get2FASecret } from './helpers/twoFA.helper';
import speakeasy from 'speakeasy';
import * as crypto from 'crypto';
import { TronWeb } from 'tronweb';

@Injectable()
export class AuthService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits is recommended for GCM
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits
  private readonly encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // 128 bits

  constructor(
    @InjectModel(User.name)
    private readonly userSchema: Model<UserDocument>,

    private readonly jwtStrategyHelper: JwtStrategyHelper,
    private readonly settingService: SettingService,
  ) {}

  generateUserCode(): string {
    return Date.now().toString();
  }

  async validateUserByEmail(email: string) {
    return await this.userSchema.findOne({ email, deletedAt: null }).exec();
  }

  async validateUserByWallet(wallet: string) {
    return await this.userSchema
      .findOne({ address: wallet, deletedAt: null })
      .exec();
  }

  async register(lang: Lang, dto: RegisterDto): Promise<RegisterResponseDto> {
    const existedUser: UserDocument = await this.validateUserByEmail(dto.email);
    if (existedUser) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.EMAIL_HAS_BEEN_USED, lang),
      );
    }

    const hash: string = await hashPassword(dto.password);
    const keypair = generateAddress();

    // Generate addresses for different networks
    const addresses = {
      [Network.ERC20]: keypair.address,
      [Network.BEP20]: keypair.address, // Same address format for EVM chains
      [Network.TRC20]: TronWeb.address.fromPrivateKey(
        this.removeHexPrefix(keypair.key),
      ),
    };

    const data = await this.userSchema.create({
      code: this.generateUserCode(),
      password: hash,
      addresses,
      prvKey: this.encryptPrivateKey(keypair.key),
      email: dto.email,
      name: dto.name,
      birthday: dto.birthday,
      gender: dto.gender,
    });

    const setting = await this.settingService.init(data._id.toString(), {
      currency: AppConstants.DEFAULT_CURRENCY,
      lang: Lang.EN,
      verification: null,
      chargeFee: false,
    });

    const { accessToken, refreshToken } = this.jwtStrategyHelper.generateToken(
      data,
      setting,
    );

    const authInformation: AuthUserInformation = new AuthUserInformation(data);
    return new RegisterResponseDto(authInformation, { accessToken, refreshToken });
  }

  async login(lang: Lang, dto: LoginDto): Promise<LoginResponseDto> {
    const user: UserDocument = await this.validateUserByEmail(dto.email);
    if (!user) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.EMAIL_NOT_EXISTED, lang),
      );
    }

    if (!user.password) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.USER_DOES_NOT_HAVE_A_PASSWORD, lang),
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(getErrorMessage(ErrorCode.USER_INACTIVE, lang));
    }

    const compare: boolean = await comparePassword(dto.password, user.password);
    if (!compare) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.INVALID_PASSWORD, lang),
      );
    }

    const setting = await this.settingService.get(user._id.toString());
    const { accessToken, refreshToken } = this.jwtStrategyHelper.generateToken(
      user,
      setting,
    );

    const authInformation: AuthUserInformation = new AuthUserInformation(user);
    return new LoginResponseDto(authInformation, { accessToken, refreshToken });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<boolean> {
    const hash: string = await hashPassword(dto.password);

    await this.userSchema.updateOne({ _id: toObjectId(userId) }, { password: hash });

    return true;
  }

  async forgotPassword(lang: Lang, dto: ForgotPasswordDto): Promise<boolean> {
    const user: UserDocument = await this.validateUserByEmail(dto.email);
    if (!user) {
      throw new BadRequestException(getErrorMessage(ErrorCode.USER_NOT_FOUND, lang));
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(getErrorMessage(ErrorCode.USER_INACTIVE, lang));
    }

    const hash: string = await hashPassword(AppConstants.DEFAULT_PASSWORD);
    await this.userSchema.updateOne(
      { _id: user._id },
      { password: hash },
      { raw: false },
    );

    return true;
  }

  async refreshToken(
    lang: Lang,
    dto: RefreshTokenDto,
  ): Promise<RegisterResponseDto> {
    const tokenData = await this.jwtStrategyHelper.verifyRefreshToken(
      lang,
      dto.refreshToken,
    );
    const user: UserDocument = await this.userSchema.findById(tokenData._id).exec();
    if (!user) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.EMAIL_NOT_EXISTED, lang),
      );
    }

    const setting = await this.settingService.get(user._id.toString());
    const { accessToken, refreshToken } = this.jwtStrategyHelper.generateToken(
      user,
      setting,
    );

    const authInformation: AuthUserInformation = new AuthUserInformation(user);
    return new RefreshTokenResponseDto(authInformation, {
      accessToken,
      refreshToken,
    });
  }

  async createAdmin(
    lang: Lang,
    dto: CreateAdminDto,
  ): Promise<CreateAdminResponseDto> {
    const existedAdmin = await this.validateUserByEmail(dto.email);
    if (existedAdmin) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.EMAIL_HAS_BEEN_USED, lang),
      );
    }

    const existedWallet = await this.validateUserByWallet(dto.address);
    if (existedWallet) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.WALLET_HAS_BEEN_REGISTER, lang),
      );
    }

    const password: string = await hashPassword(dto.password);

    const data = await this.userSchema.create({
      code: this.generateUserCode(),
      address: dto.address,
      password,
      email: dto.email,
      name: dto.name,
      birthday: dto.birthday,
      gender: dto.gender,
      role: UserRole.ADMIN,
    });

    const setting = await this.settingService.get(data._id.toString());
    const { accessToken, refreshToken } = this.jwtStrategyHelper.generateToken(
      data,
      setting,
    );
    const authInformation: AuthUserInformation = new AuthUserInformation(data);

    return new CreateAdminResponseDto(authInformation, {
      accessToken,
      refreshToken,
    });
  }

  async get2FA(userId: string) {
    try {
      const user = await this.userSchema.findById(userId);
      if (!user) throw new Error('User not found');
      if (user.twoFA) return null;
      const secret = get2FASecret(userId);
      const otpauthURL = `otpauth://totp/MonkhochirOTC:${user.name}?secret=${secret}`;
      return { otpauthURL, secret };
    } catch (error) {
      throw new BadRequestException(HttpStatus.BAD_REQUEST, error.message);
    }
  }

  async verify2FA(code: string, userId: string) {
    const secret = get2FASecret(userId);
    const isVerified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    try {
      if (isVerified) {
        await this.userSchema.findByIdAndUpdate(userId, { twoFA: true });
        return true;
      } else throw Error('Code is invalid');
    } catch (error) {
      throw new BadRequestException(HttpStatus.BAD_REQUEST, error.message);
    }
  }

  async disable2FA(code: string, userId: string) {
    const secret = get2FASecret(userId);
    const isVerified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    try {
      if (isVerified) {
        await this.userSchema.findByIdAndUpdate(userId, { twoFA: false });
        return true;
      } else throw Error('Code is invalid');
    } catch (error) {
      throw new BadRequestException(HttpStatus.BAD_REQUEST, error.message);
    }
  }

  public encryptPrivateKey(privateKey: string): string {
    const iv = crypto.randomBytes(AuthService.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      AuthService.ALGORITHM,
      this.encryptionKey,
      iv,
      { authTagLength: AuthService.AUTH_TAG_LENGTH },
    );

    const encrypted = Buffer.concat([
      cipher.update(privateKey, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Concatenate iv + authTag + encrypted data
    const encryptedBuffer = Buffer.concat([iv, authTag, encrypted]);

    // Encode the concatenated Buffer to base64 for storage or transmission
    return encryptedBuffer.toString('base64');
  }

  public decryptPrivateKey(encryptedData: string): string {
    try {
      const encryptedBuffer = Buffer.from(encryptedData, 'base64');

      // Validate the length of the encrypted buffer
      const minLength = AuthService.IV_LENGTH + AuthService.AUTH_TAG_LENGTH + 1;
      if (encryptedBuffer.length < minLength) {
        throw new Error('Invalid encrypted data length');
      }

      const iv = encryptedBuffer.subarray(0, AuthService.IV_LENGTH);
      const authTag = encryptedBuffer.subarray(
        AuthService.IV_LENGTH,
        AuthService.IV_LENGTH + AuthService.AUTH_TAG_LENGTH,
      );
      const encrypted = encryptedBuffer.subarray(
        AuthService.IV_LENGTH + AuthService.AUTH_TAG_LENGTH,
      );

      const decipher = crypto.createDecipheriv(
        AuthService.ALGORITHM,
        this.encryptionKey,
        iv,
        { authTagLength: AuthService.AUTH_TAG_LENGTH },
      );
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error('Failed to decrypt private key: ' + error.message);
    }
  }

  private removeHexPrefix(str: string) {
    return str.startsWith('0x') ? str.substring(2) : str;
  }
}
