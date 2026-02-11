import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getAdminStats(department?: string, batch?: string) {
    const where: any = {};
    if (department) where.department = department;
    if (batch) where.batch = batch;

    // 1. Total Students
    const totalStudents = await this.prisma.student.count({ where });

    // 2. Average CRS
    const aggregate = await this.prisma.student.aggregate({
      where,
      _avg: {
        currentCrs: true,
      },
    });
    const averageCrs = aggregate._avg.currentCrs || 0;
    // Normalized CRS (assuming 1000 is base, and we want 0-100 representation)
    // If scores are mostly 1000 +/- 50, then 100 +/- 5 makes sense.
    // Or if 1000 is 100%, then 1050 is 105%.
    // Display logic: 1000 -> 100.
    const normalizedCrs = Number((averageCrs / 10).toFixed(1));


    // 3. Top 5 Students
    const topStudents = await this.prisma.student.findMany({
      where,
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

    // 4. Recent Violations (Filtered by student's department/batch)
    const recentViolations = await this.prisma.studentViolation.findMany({
      where: {
        student: where,
      },
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

    // 5. Department-wise Stats (if filtering by dept, show only that dept)
    const deptStats = await this.prisma.student.groupBy({
      by: ['department'],
      where,
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
      averageCrs: normalizedCrs, // Return normalized score
      rawAverageCrs: averageCrs,
      topStudents,
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
        averageCrs: Number((d._avg.currentCrs / 10).toFixed(1)), // Normalize here too
      })),
    };
  }

  async exportStudentData(department?: string, batch?: string) {
    const where: any = {};
    if (department) where.department = department;
    if (batch) where.batch = batch;

    const students = await this.prisma.student.findMany({
      where,
      orderBy: { registerNumber: 'asc' },
      include: {
        user: { select: { email: true } },
      },
    });

    // Manual CSV generation
    const headers = ['Register Number', 'Name', 'Department', 'Batch', 'Email', 'Current CRS Score'];
    const rows = students.map(s => [
      s.registerNumber,
      `"${s.name}"`, // Quote name to handle commas
      s.department,
      s.batch,
      s.email,
      Number((s.currentCrs / 10).toFixed(1))
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    return { csv: csvContent };
  }
}
