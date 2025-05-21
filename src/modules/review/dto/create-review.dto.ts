import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  movieId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
