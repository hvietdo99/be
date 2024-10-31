import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CheckAddressDto {
  @ApiProperty({ example: 'ETH' })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string;

  @ApiProperty({ example: '0x8d036A756d379CdE6B40a202e87FbbDE17Efa8B1' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;
}
