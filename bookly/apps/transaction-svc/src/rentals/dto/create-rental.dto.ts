import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateRentalDto {
  @IsNumber()
  bookId: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  durationDays: number;
}
