import { Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';

import { CrsModule } from '../crs/crs.module';

@Module({
  imports: [CrsModule],
  controllers: [ScoresController],
  providers: [ScoresService],
})
export class ScoresModule {}
