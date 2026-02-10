import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('violations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() createViolationDto: CreateViolationDto) {
    return this.violationsService.create(createViolationDto);
  }

  @Post('record')
  @Roles('SUPER_ADMIN', 'MANAGER', 'HOD', 'TUTOR')
  record(
    @Body()
    body: { studentId: string; violationTypeId: string; comments?: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.violationsService.record(
      body.studentId,
      body.violationTypeId,
      req.user.userId,
      body.comments,
    );
  }

  @Get()
  @Roles('SUPER_ADMIN', 'MANAGER', 'STUDENT')
  findAll() {
    return this.violationsService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.violationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateViolationDto: UpdateViolationDto,
  ) {
    return this.violationsService.update(id, updateViolationDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.violationsService.remove(id);
  }
}
