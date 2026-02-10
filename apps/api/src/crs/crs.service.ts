import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculationMode } from '@prisma/client';

@Injectable()
export class CrsService {
  private readonly logger = new Logger(CrsService.name);
  //  private readonly BASE_CRS = 1000;

  constructor(private prisma: PrismaService) {}

  async calculateCrs(studentId: string): Promise<number> {
    const { finalCrs, previousCrs } =
      await this.calculateStudentDetails(studentId);

    if (finalCrs !== previousCrs) {
      const changeAmount = parseFloat((finalCrs - previousCrs).toFixed(2));
      const reason =
        changeAmount > 0 ? 'Score Improvement' : 'Score/Violation Deduction';

      await this.prisma.$transaction([
        this.prisma.student.update({
          where: { id: studentId },
          data: { currentCrs: finalCrs },
        }),
        this.prisma.crsHistory.create({
          data: {
            studentId,
            previousScore: previousCrs,
            newScore: finalCrs,
            changeAmount,
            reason,
          },
        }),
      ]);

      this.logger.log(
        `Updated CRS for student ${studentId}: ${previousCrs} -> ${finalCrs}`,
      );
    }

    return finalCrs;
  }

  async calculateStudentDetails(studentId: string) {
    this.logger.log(`Calculating Details for student ${studentId}`);

    // 1. Fetch Student & Current State
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        scores: true,
        violations: { include: { violationType: true } },
      },
    });

    if (!student) throw new Error('Student not found');

    // 2. Fetch All Parameters
    const allParameters = await this.prisma.parameter.findMany({
      include: { subParameters: true },
    });

    // 3. Calculation Logic
    let totalCrs = 0;
    const reportData = [];

    for (const param of allParameters) {
      // Logic for paramScores removed if it wasn't used anywhere else
      // But wait, inner loop uses 'student.scores' directly.
      // So 'paramScores' variable was indeed unused.

      let totalEfficiency = 0;
      const subParamDetails = [];

      for (const subParam of param.subParameters) {
        const subParamScores = student.scores.filter(
          (s) => s.subParameterId === subParam.id,
        );
        const mode = subParam.calculationMode || CalculationMode.LATEST;

        let obtained = 0;

        if (subParamScores.length > 0) {
          subParamScores.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          if (mode === CalculationMode.LATEST)
            obtained = subParamScores[0].obtainedScore;
          else if (mode === CalculationMode.SUM)
            obtained = subParamScores.reduce(
              (sum, s) => sum + s.obtainedScore,
              0,
            );
          else if (mode === CalculationMode.AVERAGE)
            obtained =
              subParamScores.reduce((sum, s) => sum + s.obtainedScore, 0) /
              subParamScores.length;
          else if (mode === CalculationMode.MAX)
            obtained = Math.max(...subParamScores.map((s) => s.obtainedScore));
        }

        let subEfficiency = 0;
        if (subParam.maxScore > 0) {
          subEfficiency = obtained / subParam.maxScore;
          if (subEfficiency > 1) subEfficiency = 1;
        }

        totalEfficiency += subEfficiency * (subParam.weightage / 100);

        // Store details for Report
        subParamDetails.push({
          id: subParam.id,
          name: subParam.name,
          score: parseFloat(obtained.toFixed(2)),
          maxScore: subParam.maxScore,
          percentage: parseFloat((subEfficiency * 100).toFixed(1)),
          date: subParamScores.length > 0 ? subParamScores[0].createdAt : null,
          mode: mode,
        });
      }

      const contribution = totalEfficiency * param.weightage;
      totalCrs += contribution;

      reportData.push({
        id: param.id,
        name: param.name,
        weightage: param.weightage,
        percentage: parseFloat((totalEfficiency * 100).toFixed(1)),
        contribution: parseFloat(contribution.toFixed(2)),
        subParameters: subParamDetails,
      });
    }

    const totalDeductions = student.violations.reduce(
      (sum, v) => sum + v.violationType.penalty,
      0,
    );
    let finalCrs = totalCrs - totalDeductions;
    if (finalCrs < 0) finalCrs = 0;
    finalCrs = parseFloat(finalCrs.toFixed(2));

    return {
      student,
      finalCrs,
      previousCrs: student.currentCrs,
      report: reportData,
      deductions: {
        total: totalDeductions,
        history: student.violations,
      },
    };
  }
}
