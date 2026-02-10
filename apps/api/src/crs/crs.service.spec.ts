import { Test, TestingModule } from '@nestjs/testing';
import { CrsService } from './crs.service';

describe('CrsService', () => {
  let service: CrsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrsService],
    }).compile();

    service = module.get<CrsService>(CrsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
