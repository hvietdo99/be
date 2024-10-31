import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class FiatDepositDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive() // Ensure the amount is greater than 0
  amount: number; // The amount being deposited
}
