import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataBaseService } from 'src/core/database/database.service';

@Injectable()
export class AdminsService {
  constructor(private database: DataBaseService) {}

  async allReviews() {
    try {
      const comments = await this.database.review.findMany({
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
          movie: {
            select: {
              id: true,
              title: true,
              slug: true,
              rating: true,
              posterUrl: true,
              createdAt: true,
            },
          },
          comment: true,
          rating: true,
          createdAt: true,
        },
      });
      return { comment_count: comments.length, comments };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
