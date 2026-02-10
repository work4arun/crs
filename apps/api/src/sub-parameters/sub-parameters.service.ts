import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubParameterDto } from './dto/create-sub-parameter.dto';
import { UpdateSubParameterDto } from './dto/update-sub-parameter.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubParametersService {
  constructor(private prisma: PrismaService) {}

  async create(createSubParameterDto: CreateSubParameterDto) {
    const { parameterId, weightage } = createSubParameterDto;

    // Check if parent parameter exists
    const parameter = await this.prisma.parameter.findUnique({
      where: { id: parameterId },
    });
    if (!parameter) {
      throw new NotFoundException('Parent parameter not found');
    }

    // Validate weightage sum within the parent parameter
    const totalWeightage = await this.prisma.subParameter.aggregate({
      _sum: { weightage: true },
      where: { parameterId },
    });

    const currentTotal = totalWeightage._sum.weightage || 0;
    if (currentTotal + weightage > 100) {
      throw new BadRequestException(
        `Total sub-parameter weightage cannot exceed 100%. Current: ${currentTotal}%`,
      );
    }

    return this.prisma.subParameter.create({
      data: createSubParameterDto,
    });
  }

  findAll() {
    return this.prisma.subParameter.findMany({
      include: { formTemplate: true },
    });
  }

  findOne(id: string) {
    return this.prisma.subParameter.findUnique({
      where: { id },
      include: { formTemplate: true },
    });
  }

  async update(id: string, updateSubParameterDto: UpdateSubParameterDto) {
    if (updateSubParameterDto.weightage !== undefined) {
      const subParam = await this.prisma.subParameter.findUnique({
        where: { id },
      });
      if (!subParam) throw new NotFoundException('SubParameter not found');

      const parameterId = subParam.parameterId;

      // Validate weightage sum
      const totalWeightage = await this.prisma.subParameter.aggregate({
        _sum: { weightage: true },
        where: {
          parameterId,
          id: { not: id },
        },
      });

      const currentTotal = totalWeightage._sum.weightage || 0;
      if (currentTotal + updateSubParameterDto.weightage > 100) {
        throw new BadRequestException(
          `Total sub-parameter weightage cannot exceed 100%. Current (excluding this): ${currentTotal}%`,
        );
      }
    }

    return this.prisma.subParameter.update({
      where: { id },
      data: updateSubParameterDto,
    });
  }

  remove(id: string) {
    return this.prisma.subParameter.delete({ where: { id } });
  }
}
