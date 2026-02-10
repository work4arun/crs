import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, role: Role, layout: any) {
    return this.prisma.dashboardConfig.create({
      data: { name, role, layout: layout as Prisma.InputJsonValue },
    });
  }

  async findAll() {
    return this.prisma.dashboardConfig.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.dashboardConfig.findUnique({ where: { id } });
  }

  async findByRole(role: Role) {
    return this.prisma.dashboardConfig.findMany({
      where: { role, isActive: true },
    });
  }
}
