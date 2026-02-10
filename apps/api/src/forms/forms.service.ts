import { Injectable } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto) {
    const { schema, ...rest } = createFormDto;
    return this.prisma.formTemplate.create({
      data: {
        ...rest,
        schema: schema as Prisma.InputJsonValue,
      },
    });
  }

  findAll() {
    return this.prisma.formTemplate.findMany();
  }

  findOne(id: string) {
    return this.prisma.formTemplate.findUnique({ where: { id } });
  }

  update(id: string, updateFormDto: UpdateFormDto) {
    const { schema, ...rest } = updateFormDto;

    const data: Record<string, any> = { ...rest };
    if (schema) {
      data.schema = schema as Prisma.InputJsonValue;
    }
    return this.prisma.formTemplate.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.formTemplate.delete({ where: { id } });
  }
}
