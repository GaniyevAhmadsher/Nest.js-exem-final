import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { ActiveSubscriptionGuard } from 'src/common/guards/active-subscription.guard';

@Controller('reviews')
@UseGuards(AuthGuard, RoleGuard)
@Roles('USER')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(ActiveSubscriptionGuard)
  async send(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    const data = await this.reviewService.send(createReviewDto, req.user.id);
    return { data };
  }

  @Get(':id')
  async comments(@Param('id') movieId: string) {
    const data = await this.reviewService.comments(movieId);
    return { data };
  }

  @Put(':id')
  async edit(
    @Body() updateReviewDto: UpdateReviewDto,
    @Param('id') id: string,
  ) {
    const data = await this.reviewService.edit(id, updateReviewDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.reviewService.delete(id);
    return { message: 'This comment deleted successfully from Comments-List' };
  }
}
