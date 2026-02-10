import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubParametersService } from './sub-parameters.service';
import { CreateSubParameterDto } from './dto/create-sub-parameter.dto';
import { UpdateSubParameterDto } from './dto/update-sub-parameter.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sub-parameters')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubParametersController {
  constructor(private readonly subParametersService: SubParametersService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() createSubParameterDto: CreateSubParameterDto) {
    return this.subParametersService.create(createSubParameterDto);
  }

  @Get()
  findAll() {
    return this.subParametersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subParametersService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateSubParameterDto: UpdateSubParameterDto,
  ) {
    return this.subParametersService.update(id, updateSubParameterDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.subParametersService.remove(id);
  }
}
