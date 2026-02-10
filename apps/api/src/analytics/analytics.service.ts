import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    // 1. Total Students
    const totalStudents = await this.prisma.student.count();

    // 2. Average CRS
    const aggregate = await this.prisma.student.aggregate({
      _avg: {
        currentCrs: true,
      },
    });
    const averageCrs = aggregate._avg.currentCrs || 0;

    // 3. Top 5 Students
    const topStudents = await this.prisma.student.findMany({
      orderBy: {
        currentCrs: 'desc',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        registerNumber: true,
        currentCrs: true,
        department: true,
      },
    });

    // 4. Recent Violations (System-wide)
    const recentViolations = await this.prisma.studentViolation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        student: {
          select: {
            name: true,
            registerNumber: true,
          },
        },
        violationType: {
          select: {
            name: true,
            penalty: true,
            severity: true,
          },
        },
      },
    });

    // 5. Department-wise Stats
    const deptStats = await this.prisma.student.groupBy({
      by: ['department'],
      _count: {
        id: true,
      },
      _avg: {
        currentCrs: true,
      },
      orderBy: {
        department: 'asc',
      },
    });

    return {
      totalStudents,
      averageCrs,
      topStudents,
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      recentViolations: recentViolations.map((v: any) => ({
        id: v.id,
        studentName: v.student.name,
        registerNumber: v.student.registerNumber,
        violation: v.violationType.name,
        penalty: v.violationType.penalty,
        severity: v.violationType.severity,
        date: v.createdAt,
      })),
      departmentStats: deptStats.map((d: any) => ({
        department: d.department,
        count: d._count.id,
        averageCrs: d._avg.currentCrs || 0,
      })),
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    };
  }
}
