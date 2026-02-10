export class CreateSubParameterDto {
  name: string;
  description?: string;
  weightage: number;
  maxScore: number;
  parameterId: string;
  scoringMode?: 'ACCUMULATIVE' | 'DEDUCTION';
  calculationMode?: 'SUM' | 'LATEST' | 'AVERAGE' | 'MAX';
  deductionValue?: number;
  minScore?: number;
  mappedManagerId?: string;
}
