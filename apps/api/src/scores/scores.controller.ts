import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('scores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'MANAGER')
  create(
    @Body() createScoreDto: CreateScoreDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.scoresService.create(createScoreDto, req.user.userId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'MANAGER', 'STUDENT')
  findAll(
    @Query('studentId') studentId: string,
    @Query('subParameterId') subParameterId: string,
  ) {
    return this.scoresService.findAll(studentId, subParameterId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoresService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'MANAGER')
  update(
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateScoreDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.scoresService.update(id, updateScoreDto, req.user.userId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'MANAGER')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.scoresService.remove(id, req.user.userId);
  }

  @Post('bulk-upload')
  @Roles('SUPER_ADMIN', 'MANAGER')
  bulkUpload(
    @Body() bulkData: any[],
    @Request() req: { user: { userId: string } },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.scoresService.bulkUpload(bulkData as any, req.user.userId);
  }
}
