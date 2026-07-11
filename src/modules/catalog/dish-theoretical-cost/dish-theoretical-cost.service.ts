import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Dish } from '../../../domain/entities/catalog/dish.entity';
import { DishTheoreticalCost } from '../../../domain/view/catalog/dish-theoretical-cost.view';

@Injectable()
export class DishTheoreticalCostService {
  constructor(
    @InjectRepository(DishTheoreticalCost)
    private readonly theoreticalCostRepo: Repository<DishTheoreticalCost>,
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
  ) {}

  findAll(tenantId: string): Promise<DishTheoreticalCost[]> {
    return this.theoreticalCostRepo.find({ where: { tenantId } });
  }

  async findByDish(
    tenantId: string,
    dishId: string,
  ): Promise<DishTheoreticalCost> {
    const dishExists = await this.dishRepo.existsBy({
      id: dishId,
      tenantId,
      deleted: false,
    });
    if (!dishExists) {
      throw new NotFoundException('Plato no encontrado');
    }

    const cost = await this.theoreticalCostRepo.findOne({
      where: { tenantId, dishId },
    });

    if (!cost) {
      throw new NotFoundException(
        'El plato no tiene receta cargada para calcular su costo',
      );
    }

    return cost;
  }
}
