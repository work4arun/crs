import { PartialType } from '@nestjs/mapped-types';
import { CreateSubParameterDto } from './create-sub-parameter.dto';

export class UpdateSubParameterDto extends PartialType(CreateSubParameterDto) {
  scoringMode?: 'ACCUMULATIVE' | 'DEDUCTION';
  calculationMode?: 'SUM' | 'LATEST' | 'AVERAGE' | 'MAX';
  deductionValue?: number;
  minScore?: number;
  mappedManagerId?: string;
}
