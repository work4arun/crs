import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('dashboards')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() body: { name: string; role: Role; layout: any }) {
    return this.dashboardsService.create(body.name, body.role, body.layout);
  }

  @Get()
  findAll(@Request() req: { user: { role: Role } }) {
    // If Admin, show all. If others, show based on their role
    if (req.user.role === 'SUPER_ADMIN') {
      return this.dashboardsService.findAll();
    }
    return this.dashboardsService.findByRole(req.user.role as Role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardsService.findOne(id);
  }
}
