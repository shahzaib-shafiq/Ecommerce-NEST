import { PartialType } from '@nestjs/mapped-types';
import { CreateCoupanDto } from './create-coupan.dto';

export class UpdateCoupanDto extends PartialType(CreateCoupanDto) {}
