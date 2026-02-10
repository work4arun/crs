import { Module, Global } from '@nestjs/common';
import { CrsService } from './crs.service';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  providers: [CrsService, PrismaService],
  exports: [CrsService],
})
export class CrsModule {}
