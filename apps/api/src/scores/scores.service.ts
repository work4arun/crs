import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { CrsService } from '../crs/crs.service';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class ScoresService {
  constructor(
    private prisma: PrismaService,
    private crsService: CrsService,
    private auditService: AuditService,
  ) {}

  async create(createScoreDto: CreateScoreDto, recordedById: string) {
    const { studentId, subParameterId, obtainedScore, data } = createScoreDto;

    // Validate SubParameter and Max Score
    const subParam = await this.prisma.subParameter.findUnique({
      where: { id: subParameterId },
    });
    if (!subParam) throw new NotFoundException('SubParameter not found');

    if (obtainedScore > subParam.maxScore) {
      throw new BadRequestException(
        `Score cannot exceed max score of ${subParam.maxScore}`,
      );
    }

    const score = await this.prisma.score.create({
      data: {
        obtainedScore,
        data: data as Prisma.InputJsonValue,
        student: { connect: { id: studentId } },
        subParameter: { connect: { id: subParameterId } },
        recordedBy: { connect: { id: recordedById } },
      },
      include: { subParameter: true, student: true },
    });

    // Log Audit
    await this.auditService.log('SCORE_ADD', 'Score', score.id, recordedById, {
      studentId,
      subParameterId,
      score: obtainedScore,
    });

    // Trigger CRS Recalculation
    await this.crsService.calculateCrs(studentId);

    return score;
  }

  findAll(studentId?: string, subParameterId?: string) {
    const where: Prisma.ScoreWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (subParameterId) where.subParameterId = subParameterId;

    return this.prisma.score.findMany({
      where,
      include: { subParameter: true, student: true, recordedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.score.findUnique({
      where: { id },
      include: { subParameter: true, student: true },
    });
  }

  // Update not fully implemented yet as per plan, but basic stub
  async update(
    id: string,
    updateScoreDto: UpdateScoreDto,
    updatedById: string,
  ) {
    const score = await this.prisma.score.findUnique({ where: { id } });
    if (!score) throw new NotFoundException('Score not found');

    // If score is changing, validate against max score
    if (updateScoreDto.obtainedScore !== undefined) {
      const subParam = await this.prisma.subParameter.findUnique({
        where: { id: score.subParameterId },
      });
      if (!subParam) throw new NotFoundException('SubParameter not found');

      if (updateScoreDto.obtainedScore > subParam.maxScore) {
        throw new BadRequestException(
          `Score cannot exceed max score of ${subParam.maxScore}`,
        );
      }
    }

    const updatedScore = await this.prisma.score.update({
      where: { id },
      data: {
        obtainedScore: updateScoreDto.obtainedScore,
        data: updateScoreDto.data
          ? (updateScoreDto.data as Prisma.InputJsonValue)
          : undefined,
      },
      include: { subParameter: true, student: true },
    });

    // Log Audit
    await this.auditService.log('SCORE_UPDATE', 'Score', id, updatedById, {
      oldScore: score.obtainedScore,
      newScore: updatedScore.obtainedScore,
    });

    // Recalculate CRS
    await this.crsService.calculateCrs(score.studentId);

    return updatedScore;
  }

  async remove(id: string, deletedById: string) {
    const score = await this.prisma.score.findUnique({ where: { id } });
    if (!score) throw new NotFoundException('Score not found');

    // Log Audit BEFORE deletion (to capture data)
    await this.auditService.log('SCORE_DELETE', 'Score', id, deletedById, {
      studentId: score.studentId,
      subParameterId: score.subParameterId,
      score: score.obtainedScore,
    });

    const deletedParams = await this.prisma.score.delete({ where: { id } });

    // Recalculate CRS
    await this.crsService.calculateCrs(score.studentId);

    return deletedParams;
  }

  async bulkUpload(
    uploadData: {
      registerNumber: string;
      subParameterName?: string;
      subParameterId?: string;
      obtainedScore: number;
      data?: any;
    }[],
    uploadedById: string,
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { item: any; error: any }[],
    };
    const affectedStudentIds = new Set<string>();

    for (const item of uploadData) {
      try {
        const { registerNumber, subParameterName, obtainedScore } = item;

        // 1. Find Student by Register Number
        const student = await this.prisma.student.findUnique({
          where: { registerNumber: String(registerNumber) },
        });
        if (!student)
          throw new Error(`Student with RegNo ${registerNumber} not found`);

        // 2. Find SubParameter by Name (Exact Match)
        // Ideally we should use ID, but for CSV bulk upload names are common.
        // Logic assumes unique names or clear mapping. Alternatively, passed ID.
        // Let's assume passed ID or unique name. If ID is provided, use it.
        let subParam;
        if (item.subParameterId) {
          subParam = await this.prisma.subParameter.findUnique({
            where: { id: item.subParameterId },
          });
        } else {
          subParam = await this.prisma.subParameter.findFirst({
            where: { name: subParameterName },
          });
        }

        if (!subParam)
          throw new Error(
            `SubParameter '${subParameterName || item.subParameterId}' not found`,
          );

        // 3. Validate Score
        const scoreVal = Number(obtainedScore);
        if (isNaN(scoreVal))
          throw new Error(`Invalid score value: ${obtainedScore}`);
        if (scoreVal > subParam.maxScore)
          throw new Error(`Score ${scoreVal} exceeds max ${subParam.maxScore}`);

        // 4. Create Score
        const score = await this.prisma.score.create({
          data: {
            obtainedScore: scoreVal,
            studentId: student.id,
            subParameterId: subParam.id,
            recordedById: uploadedById,
            data: (item.data as Prisma.InputJsonValue) || {},
          },
        });

        // 5. Audit
        await this.auditService.log(
          'SCORE_ADD_BULK',
          'Score',
          score.id,
          uploadedById,
          {
            studentId: student.id,
            subParameterId: subParam.id,
            score: scoreVal,
          },
        );

        affectedStudentIds.add(student.id);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ item, error: (error as Error).message });
      }
    }

    // Recalculate CRS for all affected students
    for (const studentId of affectedStudentIds) {
      await this.crsService.calculateCrs(studentId);
    }

    return results;
  }
}
