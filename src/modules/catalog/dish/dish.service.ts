import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { Dish } from '../../../domain/entities/catalog/dish.entity';
import { Category } from '../../../domain/entities/catalog/category.entity';
import { DishPriceHistory } from '../../../domain/entities/catalog/dish-price-history.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(tenantId: string): Promise<Dish[]> {
    return this.dishRepo.find({
      where: { tenantId, deleted: false },
      order: { name: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Dish> {
    const dish = await this.dishRepo.findOne({
      where: { id, tenantId, deleted: false },
    });

    if (!dish) {
      throw new NotFoundException('Plato no encontrado');
    }

    return dish;
  }

  async create(tenantId: string, dto: CreateDishDto): Promise<Dish> {
    if (dto.categoryId) {
      await this.assertCategoryExists(tenantId, dto.categoryId);
    }

    const dish = this.dishRepo.create({
      tenantId,
      categoryId: dto.categoryId ?? null,
      name: dto.name,
      description: dto.description ?? null,
      salePrice: dto.salePrice.toString(),
      targetFoodCostPct: (dto.targetFoodCostPct ?? 30).toString(),
      isCombo: dto.isCombo ?? false,
      active: dto.active ?? true,
      imageUrl: dto.imageUrl ?? null,
    });

    try {
      return await this.dishRepo.save(dish);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateDishDto,
  ): Promise<Dish> {
    const dish = await this.findOne(tenantId, id);

    if (dto.categoryId) {
      await this.assertCategoryExists(tenantId, dto.categoryId);
    }

    const previousSalePrice = dish.salePrice;
    const newSalePrice =
      dto.salePrice !== undefined ? dto.salePrice.toString() : dish.salePrice;
    const priceChanged =
      dto.salePrice !== undefined && newSalePrice !== previousSalePrice;

    if (dto.categoryId !== undefined) dish.categoryId = dto.categoryId;
    if (dto.name !== undefined) dish.name = dto.name;
    if (dto.description !== undefined) dish.description = dto.description;
    if (dto.salePrice !== undefined) dish.salePrice = newSalePrice;
    if (dto.targetFoodCostPct !== undefined) {
      dish.targetFoodCostPct = dto.targetFoodCostPct.toString();
    }
    if (dto.isCombo !== undefined) dish.isCombo = dto.isCombo;
    if (dto.active !== undefined) dish.active = dto.active;
    if (dto.imageUrl !== undefined) dish.imageUrl = dto.imageUrl;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const saved = await manager.save(dish);

        if (priceChanged) {
          const history = manager.create(DishPriceHistory, {
            tenantId,
            dishId: dish.id,
            oldSalePrice: previousSalePrice,
            newSalePrice,
            changedBy: userId,
          });
          await manager.save(history);
        }

        return saved;
      });
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const dish = await this.findOne(tenantId, id);
    dish.deleted = true;
    await this.dishRepo.save(dish);
  }

  private async assertCategoryExists(
    tenantId: string,
    categoryId: string,
  ): Promise<void> {
    const exists = await this.categoryRepo.existsBy({
      id: categoryId,
      tenantId,
      deleted: false,
    });

    if (!exists) {
      throw new BadRequestException(
        'La categoría indicada no existe en el tenant',
      );
    }
  }

  private handleUniqueViolation(error: unknown): unknown {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code === '23505'
    ) {
      return new ConflictException('Conflicto de unicidad al guardar el plato');
    }
    return error;
  }
}
