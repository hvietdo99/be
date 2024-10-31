import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ApiMessageKey } from '@common/constants/message.constants';
import { getApiMessage } from '@common/utils/utils';

export enum Lang {
  VI = 'vi',
  EN = 'en',
}

interface IPagination {
  page: number;
  limit: number;
  total: number;
}

export class Pagination {
  @ApiProperty()
  @ApiResponseProperty()
  readonly page: number;

  @ApiProperty()
  @ApiResponseProperty()
  readonly limit: number;

  @ApiProperty()
  @ApiResponseProperty()
  readonly total: number;

  @ApiProperty()
  @ApiResponseProperty()
  readonly totalPage: number;

  @ApiProperty()
  @ApiResponseProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  @ApiResponseProperty()
  readonly hasNextPage: boolean;

  constructor(props: IPagination) {
    this.page = props.page;
    this.limit = props.limit;
    this.total = props.total;
    this.totalPage = Math.ceil(this.total / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.totalPage;
  }
}

export interface IApiResponse {
  statusCode: HttpStatus;
  data: any;
  pagination: IPagination | null;
  message: ApiMessageKey;
  lang: Lang;
}

export class PaginatedResponse<T> {
  data: T[];
  pagination: IPagination;

  constructor(data: T[], pagination: IPagination) {
    this.data = data;
    this.pagination = pagination;
  }
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: HttpStatus.OK })
  @ApiResponseProperty()
  statusCode: HttpStatus;

  @ApiProperty()
  @ApiResponseProperty()
  data: T;

  @ApiProperty()
  @ApiResponseProperty()
  pagination?: Pagination;

  @ApiProperty({ required: false })
  @ApiResponseProperty()
  message?: string;

  constructor(props: IApiResponse) {
    this.statusCode = props.statusCode;
    this.data = props.data;
    this.pagination = props.pagination ? new Pagination(props.pagination) : null;
    this.message = getApiMessage(props.message, props.lang);
  }
}

export class FindAndCountResponse<T> {
  data: T[];
  total: number;

  constructor(data: T[], total: number) {
    this.data = data;
    this.total = total;
  }
}
