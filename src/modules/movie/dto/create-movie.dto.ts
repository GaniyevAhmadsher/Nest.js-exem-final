import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value);
    }
    return value;
  })
  @IsNumber()
  durationSecond: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value);
    }
    return value;
  })
  @IsNumber()
  releaseYear: number;

  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        if (value.startsWith('[') && value.endsWith(']')) {
          return JSON.parse(value);
        }
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  categoryIds: string[];
}
