import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller'; // Create this next
import { PrismaModule } from '../prisma/prisma.module';

@Global() // Make it global so we can easily inject it everywhere without importing Module
@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
