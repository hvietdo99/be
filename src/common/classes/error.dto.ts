import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty()
  @ApiResponseProperty()
  statusCode: number;

  @ApiProperty()
  @ApiResponseProperty()
  timestamp: Date | string;

  @ApiProperty()
  @ApiResponseProperty()
  path: string;

  @ApiProperty()
  @ApiResponseProperty()
  message: string;
}
