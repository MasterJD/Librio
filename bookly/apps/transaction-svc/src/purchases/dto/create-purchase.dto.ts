import { IsNumber, IsPositive } from 'class-validator';

export class CreatePurchaseDto {
  @IsNumber()
  @IsPositive()
  bookId: number;
}
