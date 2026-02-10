import { Injectable, ConflictException } from '@nestjs/common';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { CrsService } from '../crs/crs.service';

import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../system/notifications.service';

@Injectable()
export class ViolationsService {
  constructor(
    private prisma: PrismaService,
    private crsService: CrsService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createViolationDto: CreateViolationDto) {
    try {
      return await this.prisma.violationType.create({
        data: createViolationDto,
      });
    } catch (e: unknown) {
      if ((e as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
        throw new ConflictException(
          'Violation type with this name already exists',
        );
      }
      throw e;
    }
  }

  async record(
    studentId: string,
    violationTypeId: string,
    recordedById: string,
    comments?: string,
  ) {
    const violation = await this.prisma.studentViolation.create({
      data: {
        student: { connect: { id: studentId } },
        violationType: { connect: { id: violationTypeId } },
        recordedBy: { connect: { id: recordedById } },
        comments,
      },
      include: {
        student: true,
        violationType: true,
        recordedBy: true,
      },
    });

    // Log Audit
    await this.auditService.log(
      'VIOLATION_RECORD',
      'StudentViolation',
      violation.id,
      recordedById,
      {
        studentId,
        violationTypeId,
        violationName: violation.violationType.name,
      },
    );

    // Trigger CRS Recalculation
    await this.crsService.calculateCrs(studentId);

    // Notification: Notify Student if they have a user account
    if (violation.student.userId) {
      await this.notificationsService.create(
        violation.student.userId,
        'New Violation Recorded',
        `You have been recorded for ${violation.violationType.name} (Penalty: ${violation.violationType.penalty}).`,
        'WARNING',
      );
    }

    return violation;
  }

  findAll() {
    return this.prisma.violationType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.violationType.findUnique({ where: { id } });
  }

  update(id: string, updateViolationDto: UpdateViolationDto) {
    return this.prisma.violationType.update({
      where: { id },
      data: updateViolationDto,
    });
  }

  remove(id: string) {
    return this.prisma.violationType.delete({ where: { id } });
  }
}
