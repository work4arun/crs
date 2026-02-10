import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting daily cleanup job...');

    await this.cleanupSessions();
    await this.cleanupAuditLogs();

    this.logger.log('Daily cleanup job completed.');
  }

  private async cleanupSessions() {
    try {
      // Delete expired sessions
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      this.logger.log(`Deleted ${result.count} expired sessions.`);
    } catch (error) {
      this.logger.error('Failed to cleanup sessions', error);
    }
  }

  private async cleanupAuditLogs() {
    try {
      // Retention Policy: 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      this.logger.log(`Deleted ${result.count} old audit logs.`);
    } catch (error) {
      this.logger.error('Failed to cleanup audit logs', error);
    }
  }

  // Helper for manual trigger/tests
  async triggerCleanup() {
    await this.handleCleanup();
  }
}
