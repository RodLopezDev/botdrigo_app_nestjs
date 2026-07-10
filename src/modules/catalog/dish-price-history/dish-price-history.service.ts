import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Dish } from '../../../domain/entities/catalog/dish.entity';
import { DishPriceHistory } from '../../../domain/entities/catalog/dish-price-history.entity';

@Injectable()
export class DishPriceHistoryService {
  constructor(
    @InjectRepository(DishPriceHistory)
    private readonly priceHistoryRepo: Repository<DishPriceHistory>,
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
  ) {}

  async findByDish(
    tenantId: string,
    dishId: string,
  ): Promise<DishPriceHistory[]> {
    const exists = await this.dishRepo.existsBy({ id: dishId, tenantId });
    if (!exists) {
      throw new NotFoundException('Plato no encontrado');
    }

    return this.priceHistoryRepo.find({
      where: { tenantId, dishId },
      order: { changedAt: 'DESC' },
    });
  }
}
