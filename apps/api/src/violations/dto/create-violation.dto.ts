import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateViolationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  penalty: number;

  @IsEnum(Severity)
  severity: Severity;
}
