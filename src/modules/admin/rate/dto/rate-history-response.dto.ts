import { ApiProperty } from '@nestjs/swagger';

export class RateHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  note?: string;

  @ApiProperty()
  updatedBy: string;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<RateHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
