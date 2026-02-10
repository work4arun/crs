import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  registerNumber: string;

  @IsString()
  name: string;

  @IsString()
  department: string;

  @IsString()
  batch: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  currentCrs?: number;
}
