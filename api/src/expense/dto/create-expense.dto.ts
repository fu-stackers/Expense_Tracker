import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
  message: 'Amount must be positive and have at most 2 decimal places',
})
  amount: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}