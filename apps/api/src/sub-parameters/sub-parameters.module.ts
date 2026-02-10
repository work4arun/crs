import { Module } from '@nestjs/common';
import { SubParametersService } from './sub-parameters.service';
import { SubParametersController } from './sub-parameters.controller';

@Module({
  controllers: [SubParametersController],
  providers: [SubParametersService],
})
export class SubParametersModule {}
