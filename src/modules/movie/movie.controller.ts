import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ActiveSubscriptionGuard } from 'src/common/guards/active-subscription.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { MovieQueryDto } from './dto/query.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('movies')
@UseGuards(AuthGuard, RoleGuard)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @UseGuards(ActiveSubscriptionGuard)
  @Roles('USER')
  async movies(@Query() query: MovieQueryDto, @Req() req: Request) {
    const data = await this.movieService.allMovies(query, req.subscribe.type);
    return { data };
  }

  @Get()
  @UseGuards(ActiveSubscriptionGuard)
  @Roles('USER')
  async movieById(@Query('slug') slug: string, @Req() req: Request) {
    const movie = await this.movieService.movieById(slug, req.subscribe.type);
    const data = movie ? movie : {};
    return { data };
  }

  @Post('upload')
  @Roles('ADMIN')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'videoFiles', maxCount: 5 },
    ]),
  )
  async addMovie(
    @UploadedFiles()
    files: {
      poster?: Express.Multer.File[];
      videoFiles?: Express.Multer.File[];
    },
    @Body() movieDto: CreateMovieDto,
    @Req() req: Request,
  ) {
    const data = await this.movieService.addMovie(req.user.id, movieDto, files);
    return { data };
  }

  @Delete(':id')
  async delMovie(@Param('id') id: string) {
    await this.movieService.deleteMovie(id);
    return { message: 'Movie deleted successfully' };
  }
}
