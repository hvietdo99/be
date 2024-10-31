import { RegisterDto } from '@modules/auth/dto/register.dto';
import { GetUserDetailResponseDto } from '@modules/admin/user/dto/get-user-detail.dto';

export class CreateUserDto extends RegisterDto {}

export class CreateUserResponseDto extends GetUserDetailResponseDto {}
