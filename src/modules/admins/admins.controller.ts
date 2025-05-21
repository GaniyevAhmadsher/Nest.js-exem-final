import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';

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

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    await this.adminsService.deleteReview(id);
    return { message: 'Review deleted successfully' };
  }
}
