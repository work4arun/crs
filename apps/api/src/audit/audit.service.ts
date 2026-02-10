import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    resource: string,
    resourceId: string,
    userId: string | null,

    details?: any,
    ipAddress?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          resource,
          resourceId,
          userId,
          details: (details as Prisma.InputJsonValue) || {},
          ipAddress,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
      // We don't want to fail the main request if logging fails, ideally.
    }
  }

  async findAll(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      // We might want to include User details if we had a relation, but userId is loose string here.
      // If we want to show User Name, we'd need to fetch user separately or add relation.
      // For now, let's just return the log.
    });
  }
}
