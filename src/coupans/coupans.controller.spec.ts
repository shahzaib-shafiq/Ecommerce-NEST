import { Test, TestingModule } from '@nestjs/testing';
import { CoupansController } from './coupans.controller';
import { CoupansService } from './coupans.service';

describe('CoupansController', () => {
  let controller: CoupansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoupansController],
      providers: [CoupansService],
    }).compile();

    controller = module.get<CoupansController>(CoupansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
