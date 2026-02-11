import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('admin/stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HOD')
  async getAdminStats(
    @Query('department') department?: string,
    @Query('batch') batch?: string,
  ) {
    return this.analyticsService.getAdminStats(department, batch);
  }

  @Get('admin/export-csv')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HOD')
  async getExportCsv(
    @Query('department') department?: string,
    @Query('batch') batch?: string,
  ) {
    return this.analyticsService.exportStudentData(department, batch);
  }
}
