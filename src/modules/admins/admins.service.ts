import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataBaseService } from 'src/core/database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from 'src/modules/admins/dto/generate-slug';

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

  async deleteReview(id: string) {
    const isHas = await this.database.review.findUnique({ where: { id } });
    if (!isHas) throw new NotFoundException(`Review not found!`);
    await this.database.review.delete({ where: { id } });
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    let { name, description } = createCategoryDto;
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const isExist = await this.database.category.findUnique({
      where: { name },
    });
    if (isExist)
      throw new ConflictException(`${name} is already exist in CategoryList`);

    try {
      const slug = await generateSlug(name, this.database);
      return await this.database.category.create({
        data: { name, slug, description },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async allCategory() {
    try {
      const categories = await this.database.category.findMany();
      return { count_categories: categories.length, categories };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async oneCategory(id: string) {
    const findCategory = await this.database.category.findUnique({
      where: { id },
    });
    if (findCategory) return findCategory;
    throw new NotFoundException(`Category not found!`);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    let { name, description } = updateCategoryDto;
    let slug: string | undefined;
    if (typeof name === 'string') {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      slug = await generateSlug(name, this.database);
    }
    const isExist = await this.database.category.findUnique({ where: { id } });
    if (!isExist)
      throw new NotFoundException(`Category with this id:${id} is not exist!`);

    try {
      return await this.database.category.update({
        where: { id },
        data: { name, description, slug },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeCategory(id: string) {
    const isExist = await this.database.category.findUnique({ where: { id } });
    if (!isExist)
      throw new NotFoundException(`Category with this id:${id} is not exist!`);

    try {
      await this.database.category.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delAllCategory() {
    try {
      const del = await this.database.category.deleteMany();
      return del.count;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
