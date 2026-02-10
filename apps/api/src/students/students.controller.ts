import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'HOD')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.studentsService.uploadStudents(file);
  }

  @Post('me/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png, gif) are allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadProfilePhoto(
    @Request() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file)
      throw new BadRequestException('File is required or invalid type');
    return this.studentsService.uploadProfilePhoto(req.user.userId, file);
  }

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get('me/dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  getDashboard(@Request() req: { user: { userId: string } }) {
    return this.studentsService.getDashboard(req.user.userId);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('qr/:code')
  findByQr(@Param('code') code: string) {
    return this.studentsService.findByQr(code);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Post(':id/reset-password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'HOD')
  resetPassword(@Param('id') id: string, @Body('password') password?: string) {
    return this.studentsService.resetPassword(id, password);
  }
}
