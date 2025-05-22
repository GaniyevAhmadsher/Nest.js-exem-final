import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataBaseService } from 'src/core/database/database.service';
import { UpdatePlanDto } from './dto/update-subPlan.dto';
import { CreatePlanDto } from './dto/create-subPlan.dto';
import { hash } from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class SuperAdminsService {
  constructor(private readonly prisma: DataBaseService) {}

  async createPlan(dto: CreatePlanDto) {
    let { name, duration, price, unit, features, isActive } = dto;
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const isEx = await this.prisma.subscriptionPlan.findUnique({
      where: { name },
    });
    if (isEx) throw new ConflictException(`Plan Already exist`);
    try {
      return this.prisma.subscriptionPlan.create({ data: dto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async deletePlan(id: string) {
    return this.prisma.subscriptionPlan.delete({ where: { id } });
  }

  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // * Admins
  async createAdmin(dto: CreateAdminDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already in use');

    const hashedPassword = await hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getAllAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        createdAt: true,
      },
    });
  }

  async deleteAdmin(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
