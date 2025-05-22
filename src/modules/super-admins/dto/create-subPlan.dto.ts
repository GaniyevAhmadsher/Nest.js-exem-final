import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { SPlanUnit } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  duration: number;

  @IsEnum(SPlanUnit)
  unit: SPlanUnit;

  @IsOptional()
  features?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
