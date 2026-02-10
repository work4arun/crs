import { Module } from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { ViolationsController } from './violations.controller';

import { CrsModule } from '../crs/crs.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [CrsModule, SystemModule],
  controllers: [ViolationsController],
  providers: [ViolationsService],
})
export class ViolationsModule {}
