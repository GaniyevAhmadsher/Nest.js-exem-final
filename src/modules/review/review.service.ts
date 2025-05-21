import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DataBaseService } from 'src/core/database/database.service';

@Injectable()
export class ReviewService {
  constructor(private readonly database: DataBaseService) {}

  async send(reviewDto: CreateReviewDto, userId: string) {
    try {
      return await this.database.review.create({
        data: {
          userId,
          movieId: reviewDto.movieId,
          rating: reviewDto.rating,
          comment: reviewDto.comment,
        },
        select: {
          id: true,
          userId: true,
          movie: {
            select: { id: true, title: true, posterUrl: true, rating: true },
          },
          rating: true,
          createdAt: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async comments(movieId: string) {
    try {
      const comment = await this.database.review.findMany({
        where: { movieId },
        select: {
          id: true,
          movie: {
            select: { id: true, title: true, posterUrl: true, rating: true },
          },
          rating: true,
          comment: true,
          user: {
            select: {
              fullName: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
      return { comment_count: comment.length, comment };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async edit(id: string, updateDto: UpdateReviewDto) {
    try {
      return await this.database.review.update({
        where: { id },
        data: { rating: updateDto.rating, comment: updateDto.comment },
        select: {
          id: true,
          userId: true,
          movie: {
            select: { id: true, title: true, posterUrl: true, rating: true },
          },
          rating: true,
          createdAt: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: string) {
    const isHas = await this.database.review.findUnique({ where: { id } });
    if (!isHas) throw new NotFoundException(`Comment not found!`);
    try {
      await this.database.review.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
