import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { DataBaseService } from 'src/core/database/database.service';
import { MovieQueryDto } from './dto/query.dto';
import { MovieFile, Prisma } from '@prisma/client';
import { generateSlug } from './dto/generate-slug';
import { getVideoLanguage, getVideoQuality } from 'src/common/utils/movie.util';
import { SubscriptionType } from 'src/common/@types/literal.enum';

@Injectable()
export class MovieService {
  constructor(private readonly database: DataBaseService) {}

  async allMovies(query: MovieQueryDto, userSubType: SubscriptionType) {
    try {
      const where: Prisma.MovieWhereInput = {
        title: query.title
          ? { contains: query.title, mode: 'insensitive' }
          : undefined,
        releaseYear: query.releaseYear,
        subscriptionType: userSubType === 'FREE' ? 'FREE' : undefined,
        files: query.language
          ? {
              some: {
                language: { equals: query.language, mode: 'insensitive' },
              },
            }
          : undefined,
        categories: query.category
          ? {
              some: {
                category: {
                  name: { contains: query.category, mode: 'insensitive' },
                },
              },
            }
          : undefined,
      };
      return await this.database.movie.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          releaseYear: true,
          durationSecond: true,
          posterUrl: true,
          rating: true,
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  slug: true,
                  createdAt: true,
                },
              },
            },
          },
          files: {
            select: {
              id: true,
              fileUrl: true,
              quality: true,
              language: true,
              createdAt: true,
            },
          },
          subscriptionType: true,
          viewCount: true,
          createdAt: true,
        },
        where,
        take: query.limit,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async movieById(slug: string, userSubType: SubscriptionType) {
    const movie = await this.database.movie.findFirst({
      where: {
        slug: slug.toLowerCase(),
        subscriptionType: userSubType === 'FREE' ? 'FREE' : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        releaseYear: true,
        durationSecond: true,
        posterUrl: true,
        rating: true,
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                slug: true,
                createdAt: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            fileUrl: true,
            quality: true,
            language: true,
            createdAt: true,
          },
        },
        subscriptionType: true,
        viewCount: true,
        createdAt: true,
      },
    });
    if (movie) return movie;
    throw new NotFoundException(`This Movie is not exist in MoviesList!`);
  }

  async addMovie(
    user_id: string,
    movieDto: CreateMovieDto,
    files: {
      poster?: Express.Multer.File[];
      videoFiles?: Express.Multer.File[];
    },
  ) {
    if (!files.poster || !files.poster[0])
      throw new BadRequestException('Poster is required');

    if (!files.videoFiles || files.videoFiles.length === 0)
      throw new BadRequestException('At least one video file is required');

    const titleSlug = await generateSlug(movieDto.title, this.database);
    try {
      const posterPath = `/uploads/avatars/${files.poster[0].filename}`;

      const movie = await this.database.movie.create({
        data: {
          title: movieDto.title,
          slug: titleSlug,
          description: movieDto.description,
          posterUrl: posterPath,
          createdById: user_id,
          releaseYear: movieDto.releaseYear,
          durationSecond: movieDto.durationSecond,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          releaseYear: true,
          durationSecond: true,
          posterUrl: true,
          subscriptionType: true,
          createdAt: true,
        },
      });

      // 🔗 Add Movie ↔ Categories
      for (const categoryId of movieDto.categoryIds) {
        await this.database.movieCategory.create({
          data: {
            movieId: movie.id,
            categoryId,
          },
        });
      }

      // 🎞️ Save movie files
      const movieFilesList: MovieFile[] = [];

      for (const videoFile of files.videoFiles || []) {
        if (!videoFile) continue;

        const videoPath = `uploads/movies/${videoFile.filename}`;
        const fullPath = `${process.cwd()}/${videoPath}`;

        // 🧠 Auto quality aniqlash
        const quality = await getVideoQuality(fullPath);

        // 📝 Doimiy default til
        let language: string;
        try {
          language = await getVideoLanguage(fullPath);
        } catch (error) {
          language = 'uz';
        }

        // 🎬 MovieFile yozuvi
        const movieFile = await this.database.movieFile.create({
          data: {
            movieId: movie.id,
            fileUrl: `/${videoPath}`,
            quality,
            language,
          },
        });

        movieFilesList.push(movieFile);
      }

      return { movie, files: movieFilesList };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateMovie() {}

  async deleteMovie(id: string) {
    const isHas = await this.database.movie.findUnique({ where: { id } });
    if (!isHas) throw new NotFoundException(`Movie not found`);

    try {
      await this.database.movie.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
