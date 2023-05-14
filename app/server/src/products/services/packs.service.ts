import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Pack } from '@prisma/client';

import { PackComponentEntity } from '../entities/pack-component.entity';
import { PackProductEntity } from '../entities/pack-product.entity';
import { PackEntity } from '../entities/pack.entity';
import { PackMapper } from '../mappers/pack.mapper';
import { ProductsService } from './products.service';

@Injectable()
export class PacksService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductsService,
  ) {}

  async findAll() {
    return 'packs';
  }

  async findOne(code: number): Promise<PackEntity> {
    const pack = await this.prisma.pack.findMany({ where: { packId: code } });
    if (pack.length === 0) {
      return null;
    }

    const packData = await this.productService.findOne(code);

    const products = await this.findPackComponents(pack);

    return PackMapper.withProducts(packData, products);
  }

  async findPackComponents(pack: Pack[]): Promise<PackProductEntity[]> {
    return await Promise.all(
      pack.map(async (p) => await this.findComponentAndMap(p)),
    );
  }

  async findComponentAndMap(
    pack: PackComponentEntity,
  ): Promise<PackProductEntity> {
    const product = await this.productService.findOne(pack.productId);

    return {
      packItemId: pack.id,
      code: product.code,
      name: product.name,
      costPrice: product.costPrice.toNumber(),
      salesPrice: product.salesPrice.toNumber(),
      qty: pack.qty,
    };
  }
}
