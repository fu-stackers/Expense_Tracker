import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Lunch', description: 'Expense title' })
  title: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be positive and have at most 2 decimal places',
  })
  @ApiProperty({ example: '250.50', description: 'Expense amount' })
  amount: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Food', description: 'Expense category' })
  category: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2026-11-03' })
  date?: string;
}
