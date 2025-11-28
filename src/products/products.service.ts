import { Injectable, NotFoundException ,ForbiddenException,BadRequestException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from 'common/enums/Roles';
import * as XLSX from 'xlsx';
import slugify from 'slugify';
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE PRODUCT
  // ----------------------------
  async create(dto: CreateProductDto) {

    // CHECK IF STORE EXISTS
  const store = await this.prisma.store.findUnique({
    where: { id: dto.storeId },
  });

  if (!store) {
    throw new NotFoundException(`Store with ID ${dto.storeId} not found`);
  }

  // CHECK IF USER EXISTS
  const user = await this.prisma.user.findUnique({
    where: { id: dto.createdById },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${dto.createdById} not found`);
  }

  // CHECK USER ROLE
  if (user.role !== Role.STORE_OWNER) {
    throw new ForbiddenException(
      `Only STORE_OWNER can create products`
    );
  }

    return await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        images: dto.images ?? [],
        storeId: dto.storeId,
        createdById: dto.createdById,
      },
    });
  }

  // ----------------------------
  // GET ALL PRODUCTS
  // ----------------------------
  async findAll() {
    return await this.prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        store: true,
        createdBy: true,
      },
    });
  }

  // ----------------------------
  // GET PRODUCT BY ID
  // ----------------------------
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        createdBy: true,
      },
    });

    if (!product || product.isDeleted)
      throw new NotFoundException('Product not found');

    return product;
  }

  // ----------------------------
  // UPDATE PRODUCT
  // ----------------------------
  async update(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });

    if (!exists || exists.isDeleted)
      throw new NotFoundException('Product not found');

    return await this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  // ----------------------------
  // SOFT DELETE PRODUCT
  // ----------------------------
  async remove(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });

    if (!exists || exists.isDeleted)
      throw new NotFoundException('Product not found');

    return await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
  // Upload Bulk Products
  async importProductsFromExcel(filePath: string) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      // Required columns
      const requiredColumns = [
        'name',
        'description',
        'price',
        'stock',
        'storeId',
        'createdById',
        'categoryId',
      ];

      // Validate columns
      const firstRow = rows[0];
      for (const col of requiredColumns) {
        if (!Object.keys(firstRow).includes(col)) {
          throw new BadRequestException(
            `Missing required column: "${col}" in Excel file`,
          );
        }
      }

      const errors: any[] = [];
      let successCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const slug = slugify(row.name, { lower: true, strict: true });
        try {
          await this.prisma.product.create({
            data: {
              name: row.name,
              slug,
              description: row.description,
              price: Number(row.price),
              stock: Number(row.stock),
              images: row.images ? row.images.split(',') : [],

              storeId: row.storeId,
              createdById: row.createdById,
              categoryId: row.categoryId || null,
            },
          });

          successCount++;
        } catch (err) {
          errors.push({
            row: i + 2, // row number in Excel (header is row 1)
            error: err.message,
            data: row,
          });
        }
      }

      return {
        successCount,
        failedCount: errors.length,
        errors,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process Excel file: ${error.message}`,
      );
    }
  }
}
