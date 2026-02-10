import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParametersService {
  constructor(private prisma: PrismaService) {}

  async create(createParameterDto: CreateParameterDto) {
    // Validate weightage sum does not exceed 100
    const totalWeightage = await this.prisma.parameter.aggregate({
      _sum: { weightage: true },
    });

    const currentTotal = totalWeightage._sum.weightage || 0;
    if (currentTotal + createParameterDto.weightage > 100) {
      throw new BadRequestException(
        `Total weightage cannot exceed 100%. Current: ${currentTotal}%`,
      );
    }

    return this.prisma.parameter.create({
      data: createParameterDto,
    });
  }

  findAll() {
    return this.prisma.parameter.findMany({
      include: {
        subParameters: {
          include: { formTemplate: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.parameter.findUnique({
      where: { id },
      include: {
        subParameters: {
          include: { formTemplate: true },
        },
      },
    });
  }

  async update(id: string, updateParameterDto: UpdateParameterDto) {
    try {
      if (updateParameterDto.weightage !== undefined) {
        // Validate weightage sum does not exceed 100
        const totalWeightage = await this.prisma.parameter.aggregate({
          _sum: { weightage: true },
          where: { id: { not: id } }, // Exclude current parameter
        });
        console.log('Update Debug:', {
          totalWeightage,
          updateWeight: updateParameterDto.weightage,
        });

        const currentTotal = totalWeightage._sum.weightage || 0;
        if (currentTotal + updateParameterDto.weightage > 100) {
          throw new BadRequestException(
            `Total weightage cannot exceed 100%. Current (excluding this): ${currentTotal}%`,
          );
        }
      }

      return await this.prisma.parameter.update({
        where: { id },
        data: updateParameterDto,
      });
    } catch (error) {
      console.error('Update Error:', error);
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.parameter.delete({
      where: { id },
    });
  }
}
