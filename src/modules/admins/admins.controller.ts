import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admins')
@UseGuards(AuthGuard, RoleGuard)
@Roles('ADMIN')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('reviews')
  async allReviews() {
    const data = await this.adminsService.allReviews();
    return { data };
  }

  @Delete('reviews/:id')
  async deleteComment(@Param('id') id: string) {
    await this.adminsService.deleteReview(id);
    return { message: 'Review deleted successfully' };
  }

  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {}

  @Get('categories')
  async allCategory() {}

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {}

  @Delete('categories/:id')
  async removeCategory(@Param('id') id: string) {}
}
