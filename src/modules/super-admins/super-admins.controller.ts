import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { SuperAdminsService } from './super-admins.service';
import { UpdatePlanDto } from './dto/update-subPlan.dto';
import { CreatePlanDto } from './dto/create-subPlan.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('superadmin')
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPER_ADMIN')
export class SuperAdminsController {
  constructor(private readonly service: SuperAdminsService) {}

  @Post('plans')
  async createPlan(@Body() dto: CreatePlanDto) {
    const data = await this.service.createPlan(dto);
    return { message: 'Plan created successfully', data };
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    const data = await this.service.updatePlan(id, dto);
    return { message: 'Plan updated successfully', data };
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    await this.service.deletePlan(id);
    return { message: 'Plan deleted successfully' };
  }

  @Get('plans')
  async getAllPlans() {
    const plan = await this.service.findAllPlans();
    return { data: { plan_count: plan.length, plan } };
  }

  // === ADMINS ===
  @Post('admins')
  async createAdmin(@Body() dto: CreateAdminDto) {
    const data = await this.service.createAdmin(dto);
    return { message: 'Admin created successfully', data };
  }

  @Get('admins')
  async getAllAdmins() {
    const admins = await this.service.getAllAdmins();
    return { data: { admins, admins_count: admins.length } };
  }

  @Delete('admins/:id')
  async deleteAdmin(@Param('id') id: string) {
    await this.service.deleteAdmin(id);
    return { message: 'Admin deleted successfully' };
  }
}
