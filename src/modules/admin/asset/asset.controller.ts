import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from '@modules/admin/asset/asset.service';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { Language } from '@common/decorators/lang.decorator';
import {
  ApiResponseDto,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import {
  FindAllAssetDto,
  FindAllAssetResponseDto,
} from '@modules/admin/asset/dto/find-all-asset.dto';
import { ApiMessageKey } from '@common/constants/message.constants';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { BasicHeader } from '@common/decorators/basic-header.decorator';
import { SaveAssetDto } from '@modules/admin/asset/dto/save-asset.dto';
import { GetAssetDetailResponseDto } from '@modules/admin/asset/dto/get-asset-detail.dto';
import { UpdateAssetDto } from '@modules/admin/asset/dto/update-asset.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/database/schemas/user.schema';
import { RoleGuard } from '@common/guards/role.guard';

@BasicHeader('Asset')
@Controller('admin/asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all assets',
    description: 'Get all assets',
  })
  @Roles([UserRole.ADMIN, UserRole.SU])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<FindAllAssetResponseDto[]> })
  async findAll(@Language() lang: Lang, @Query() query: FindAllAssetDto) {
    try {
      const { data, pagination }: PaginatedResponse<FindAllAssetResponseDto> =
        await this.assetService.findAll(query);

      return new ApiResponseDto<FindAllAssetResponseDto[]>({
        statusCode: HttpStatus.OK,
        data,
        pagination,
        message: ApiMessageKey.GET_ALL_ASSET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get asset detail',
    description: 'Get asset detail',
  })
  @Roles([UserRole.ADMIN, UserRole.SU])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAssetDetailResponseDto> })
  async findOne(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data: GetAssetDetailResponseDto = await this.assetService.findOne(id);

      return new ApiResponseDto<GetAssetDetailResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.GET_ASSET_DETAIL_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Save asset',
    description: 'Save asset',
  })
  @Roles([UserRole.ADMIN, UserRole.SU])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async save(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Body() body: SaveAssetDto,
  ) {
    try {
      const data: boolean = await this.assetService.save(lang, auth._id, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.SAVE_ASSET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update asset',
    description: 'Update asset',
  })
  @Roles([UserRole.ADMIN, UserRole.SU])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateStatus(
    @Language() lang: Lang,
    @Param('id') id: string,
    @Body() body: UpdateAssetDto,
  ) {
    try {
      const data: boolean = await this.assetService.update(lang, id, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.UPDATE_ASSET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete asset',
    description: 'Delete asset',
  })
  @Roles([UserRole.ADMIN, UserRole.SU])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async delete(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data: boolean = await this.assetService.delete(lang, id);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.DELETE_ASSET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}
