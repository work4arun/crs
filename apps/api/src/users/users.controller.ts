import * as bcrypt from 'bcrypt';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Prisma, Role } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private prisma: PrismaService) { }

  @Get()
  @Roles('SUPER_ADMIN')
  async findAll(@Query('role') role?: string) {
    const where: Prisma.UserWhereInput = role ? { role: role as Role } : {};
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        department: true,
        section: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  @Patch(':id/password')
  @Roles('SUPER_ADMIN')
  async updatePassword(@Param('id') id: string, @Body() body: { password: string }) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  @Post('check-user')
  @Roles('SUPER_ADMIN')
  async checkUser(@Body() body: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: { student: true },
    });
    return {
      exists: !!user,
      email: user?.email,
      role: user?.role,
      department: user?.department,
      section: user?.section,
      hasStudentProfile: !!user?.student,
      studentName: user?.student?.name,
    };
  }

  @Post()
  @Roles('SUPER_ADMIN')
  async create(@Body() data: Prisma.UserCreateInput) {
    // Hash password (lazy implementation here, ideally reuse AuthService or move hash logic to utility)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        department: data.department,
        section: data.section,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async delete(@Param('id') id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
