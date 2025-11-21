import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoupansService } from './coupans.service';
import { CreateCoupanDto } from './dto/create-coupan.dto';
import { UpdateCoupanDto } from './dto/update-coupan.dto';

@Controller('coupans')
export class CoupansController {
  constructor(private readonly coupansService: CoupansService) {}

  @Post()
  create(@Body() createCoupanDto: CreateCoupanDto) {
    return this.coupansService.create(createCoupanDto);
  }

  @Get()
  findAll() {
    return this.coupansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coupansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoupanDto: UpdateCoupanDto) {
    return this.coupansService.update(+id, updateCoupanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coupansService.remove(+id);
  }
}
