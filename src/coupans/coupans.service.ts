import { Injectable } from '@nestjs/common';
import { CreateCoupanDto } from './dto/create-coupan.dto';
import { UpdateCoupanDto } from './dto/update-coupan.dto';

@Injectable()
export class CoupansService {
  create(createCoupanDto: CreateCoupanDto) {
    return 'This action adds a new coupan';
  }

  findAll() {
    return `This action returns all coupans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coupan`;
  }

  update(id: number, updateCoupanDto: UpdateCoupanDto) {
    return `This action updates a #${id} coupan`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupan`;
  }
}
