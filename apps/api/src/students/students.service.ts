import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const csv = require('csv-parser');
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';
import { CrsService } from '../crs/crs.service';
import * as fs from 'fs';
import * as path from 'path';

interface CrsScore {
  obtainedScore: number;
  subParameterId: string;
  subParameter: {
    parameterId: string;
  };
  createdAt: Date;
}

interface CrsViolation {
  violationType: {
    penalty: number;
  };
  createdAt: Date;
}

interface CrsParameter {
  id: string;
  weightage: number;
  subParameters: {
    id: string;
    maxScore: number;
    weightage: number;
    calculationMode: 'LATEST' | 'SUM' | 'AVERAGE' | 'MAX' | null;
    scoringMode: 'ACCUMULATIVE' | 'DEDUCTION';
    deductionValue: number | null;
    minScore: number | null;
  }[];
}

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private crsService: CrsService,
  ) { }

  async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student profile not found');

    // DEBUG: Log paths
    console.log('--- Upload Trace ---');
    console.log('CWD:', process.cwd());

    // Define upload path: apps/web/public/uploads/profile-photos
    // process.cwd() is apps/api, so we go up one level to apps, then to web
    const uploadDir = path.resolve(process.cwd(), '../web/public/uploads/profile-photos');
    console.log('Target Upload Dir:', uploadDir);

    // Ensure directory exists
    try {
      if (!fs.existsSync(uploadDir)) {
        console.log('Directory does not exist. Creating...');
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Directory created.');
      }
    } catch (err) {
      console.error('Error creating directory:', err);
      throw new Error(`Failed to create upload directory: ${err.message}`);
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${student.registerNumber}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    try {
      await fs.promises.writeFile(filePath, file.buffer);
      console.log('File written successfully to:', filePath);
    } catch (err) {
      console.error('Error writing file:', err);
      throw new Error(`Failed to write file: ${err.message}`);
    }

    // Update Student Record (Store relative URL for Frontend)
    const publicUrl = `/uploads/profile-photos/${fileName}`;

    await this.prisma.student.update({
      where: { id: student.id },
      data: { profilePhoto: publicUrl } as any,
    });

    return { url: publicUrl };
  }

  async uploadStudents(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const results: Record<string, any>[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
      stream
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
        .on('error', (error: any) =>
          reject(error instanceof Error ? error : new Error(String(error))),
        )
        .on('end', async () => {
          try {
            const processed = await this.processStudents(results);
            resolve({ count: processed.length, students: processed });
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
    });
  }

  async processStudents(data: Record<string, any>[]) {
    const students = [];
    for (const item of data) {
      // Normalize keys to lowercase and trim values
      const normalizedItem = Object.keys(item).reduce(
        (acc, key) => {
          const normalizedKey = key.toLowerCase().replace(/\s/g, '');
          let value = item[key] as unknown;
          if (typeof value === 'string') {
            value = value.trim();
          }
          acc[normalizedKey] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

      const registerNumber = normalizedItem['registernumber'] as string;

      const email = normalizedItem['email'] as string;

      const name = (normalizedItem['name'] || normalizedItem['nme']) as string;

      const department = normalizedItem['department'] as string;

      const batch = normalizedItem['batch'] as string;

      const section = normalizedItem['section'] as string;

      const whatsappNumber = (normalizedItem['whatsapp'] ||
        normalizedItem['whatsappnumber']) as string;

      if (!registerNumber || !email || !name || !department || !batch) {
        console.warn(
          `Skipping row due to missing fields: RegNo=${registerNumber}, Email=${email}, Name=${name}, Department=${department}, Batch=${batch}`,
        );
        continue;
      }

      // Check if User exists, if not create one
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        const passwordToSet = (normalizedItem['password'] ||
          registerNumber) as string;
        const hashedPassword = await bcrypt.hash(passwordToSet, 10);
        user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: Role.STUDENT,
          },
        });
      }

      const student = await this.prisma.student.upsert({
        where: { registerNumber },
        update: {
          name: name,
          department: department,
          section: section,
          batch: batch,
          email: email,
          whatsappNumber: whatsappNumber,
          user: { connect: { id: user.id } },
        },
        create: {
          name: name,
          registerNumber: registerNumber,
          department: department,
          section: section,
          batch: batch,
          email: email,
          whatsappNumber: whatsappNumber,
          user: { connect: { id: user.id } },
        },
      });
      students.push(student);
    }
    return students;
  }

  async create(createStudentDto: CreateStudentDto) {
    try {
      // Create User first if not exists
      let user = await this.prisma.user.findUnique({
        where: { email: createStudentDto.email },
      });
      if (!user) {
        const hashedPassword = await bcrypt.hash(
          createStudentDto.registerNumber,
          10,
        );
        user = await this.prisma.user.create({
          data: {
            email: createStudentDto.email,
            password: hashedPassword,
            role: Role.STUDENT,
          },
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, ...studentData } = createStudentDto;

      return await this.prisma.student.create({
        data: {
          ...studentData,
          user: { connect: { id: user.id } },
        },
      });
    } catch (e) {
      if ((e as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
        throw new BadRequestException(
          'Student with this Register Number or Email already exists',
        );
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.student.findMany();
  }

  findOne(id: string) {
    return this.prisma.student.findUnique({ where: { id } });
  }

  findByQr(qrCode: string) {
    return this.prisma.student.findUnique({ where: { qrCode } });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    console.log('Updating student:', id, updateStudentDto);
    try {
      return await this.prisma.student.update({
        where: { id },
        data: updateStudentDto,
      });
    } catch (e) {
      console.error('Update Error:', e);
      throw e;
    }
  }

  async remove(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (student && student.userId) {
      // Delete the user account as well to prevent orphaned logins
      await this.prisma.user.delete({ where: { id: student.userId } });
    }
    return this.prisma.student.delete({ where: { id } });
  }

  async getDashboard(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        scores: {
          include: {
            subParameter: {
              include: { parameter: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        violations: {
          include: { violationType: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!student) {
      throw new BadRequestException('Student profile not found for this user');
    }

    // 1. Fetch All Main Parameters to ensure we show even those with 0 scores
    const allParameters = await this.prisma.parameter.findMany({
      include: { subParameters: true },
    });

    // 2. Aggregation Logic (Delegated to CrsService)
    const { finalCrs, report, deductions } =
      await this.crsService.calculateStudentDetails(student.id);

    // Star Rating (Simple scale out of 100)
    let starRating = 0;
    if (finalCrs >= 90) starRating = 5;
    else if (finalCrs >= 75) starRating = 4;
    else if (finalCrs >= 60) starRating = 3;
    else if (finalCrs >= 40) starRating = 2;
    else if (finalCrs > 0) starRating = 1;

    return {
      student: {
        id: student.id,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        currentCrs: finalCrs, // Return calculated valid CRS
        starRating: starRating,
        qrCode: student.qrCode,
        // email: student.email // Add if needed by frontend
        email: student.email,
        profilePhoto: (student as any).profilePhoto,
      },
      report: report,
      deductions: deductions,
      // Growth History Graph Data
      growthHistory: (() => {
        // Sort scores and violations
        const sortedScores = student.scores.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );

        // Get unique dates
        const dates = new Set([
          ...sortedScores.map((s) => s.createdAt.toISOString().split('T')[0]),
          new Date().toISOString().split('T')[0], // Always include today
        ]);

        return Array.from(dates)
          .sort()
          .map((dateStr) => {
            // CRS at end of this day
            return {
              date: dateStr,
              crs: this.calculateRawCrs(
                student.scores.filter(
                  (s) => s.createdAt.toISOString().split('T')[0] <= dateStr,
                ) as unknown as CrsScore[],
                student.violations.filter(
                  (v) => v.createdAt.toISOString().split('T')[0] <= dateStr,
                ) as unknown as CrsViolation[],
                allParameters as unknown as CrsParameter[],
              ),
            };
          });
      })(),
    };
  }

  async resetPassword(studentId: string, password?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const newPassword = password || student.registerNumber; // Default to RegNo if not provided
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (student.userId) {
      // Update existing user
      await this.prisma.user.update({
        where: { id: student.userId },
        data: { password: hashedPassword },
      });
    } else {
      // Create user if missing (edge case)
      const user = await this.prisma.user.create({
        data: {
          email: student.email,
          password: hashedPassword,
          role: Role.STUDENT,
        },
      });
      await this.prisma.student.update({
        where: { id: student.id },
        data: { userId: user.id },
      });
    }

    return { message: 'Password updated successfully' };
  }

  private calculateRawCrs(
    scores: CrsScore[],
    violations: CrsViolation[],
    allParameters: CrsParameter[],
  ) {
    let totalCrs = 0;

    for (const param of allParameters) {
      const paramScores = scores.filter(
        (s) => s.subParameter.parameterId === param.id,
      );

      let totalEfficiency = 0;

      if (param.subParameters) {
        for (const subParam of param.subParameters) {
          const subParamScores = paramScores.filter(
            (s) => s.subParameterId === subParam.id,
          );
          const mode = subParam.calculationMode || 'LATEST';

          let obtained = 0;
          const max = subParam.maxScore;

          if (subParamScores.length > 0 || (subParam as any).scoringMode === 'DEDUCTION') {
            // Cast to any because the interface update above might not be fully propagated to the runtime object structure in this context if strict typing issues arise, but locally it should be fine.
            // Actually, we updated the interface.
            const isDeduction = (subParam as any).scoringMode === 'DEDUCTION';

            if (isDeduction) {
              let penalty = 0;
              if (subParamScores.length > 0) {
                const dedVal = (subParam as any).deductionValue;
                if (dedVal && dedVal > 0) {
                  penalty = subParamScores.length * dedVal;
                } else {
                  penalty = subParamScores.reduce((sum, s) => sum + s.obtainedScore, 0);
                }
              }
              obtained = max - penalty;
              const min = (subParam as any).minScore || 0;
              if (obtained < min) obtained = min;
            }
            else {
              // ACCUMULATIVE
              if (subParamScores.length > 0) {
                if (mode === 'LATEST') {
                  subParamScores.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  );
                  obtained = subParamScores[0].obtainedScore;
                } else if (mode === 'SUM') {
                  obtained = subParamScores.reduce(
                    (sum, s) => sum + s.obtainedScore,
                    0,
                  );
                } else if (mode === 'AVERAGE') {
                  const sum = subParamScores.reduce(
                    (sum, s) => sum + s.obtainedScore,
                    0,
                  );
                  obtained = sum / subParamScores.length;
                } else if (mode === 'MAX') {
                  obtained = Math.max(
                    ...subParamScores.map((s) => s.obtainedScore),
                  );
                }
              }
            }
          }

          let subEfficiency = 0;
          if (max > 0) {
            subEfficiency = obtained / max;
            if (subEfficiency > 1) subEfficiency = 1;
          }

          totalEfficiency += subEfficiency * (subParam.weightage / 100);
        }
      }

      totalCrs += totalEfficiency * param.weightage;
    }

    const totalDeductions = violations.reduce(
      (sum, v) => sum + v.violationType.penalty,
      0,
    );
    return Math.max(0, parseFloat((totalCrs - totalDeductions).toFixed(2)));
  }
}
