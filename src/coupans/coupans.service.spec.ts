import { Test, TestingModule } from '@nestjs/testing';
import { CoupansService } from './coupans.service';

describe('CoupansService', () => {
  let service: CoupansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoupansService],
    }).compile();

    service = module.get<CoupansService>(CoupansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
