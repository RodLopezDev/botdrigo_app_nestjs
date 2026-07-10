import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Dish } from '../../../domain/entities/catalog/dish.entity';
import { Ingredient } from '../../../domain/entities/catalog/ingredient.entity';
import { DishIngredient } from '../../../domain/entities/catalog/dish-ingredient.entity';
import { CreateDishIngredientDto } from './dto/create-dish-ingredient.dto';
import { UpdateDishIngredientDto } from './dto/update-dish-ingredient.dto';

@Injectable()
export class DishIngredientService {
  constructor(
    @InjectRepository(DishIngredient)
    private readonly dishIngredientRepo: Repository<DishIngredient>,
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async findAll(tenantId: string, dishId: string): Promise<DishIngredient[]> {
    await this.assertDishExists(tenantId, dishId);
    return this.dishIngredientRepo.find({
      where: { tenantId, dishId },
      relations: { ingredient: true },
    });
  }

  async create(
    tenantId: string,
    dishId: string,
    dto: CreateDishIngredientDto,
  ): Promise<DishIngredient> {
    await this.assertDishExists(tenantId, dishId);
    await this.assertIngredientExists(tenantId, dto.ingredientId);

    const dishIngredient = this.dishIngredientRepo.create({
      tenantId,
      dishId,
      ingredientId: dto.ingredientId,
      quantity: dto.quantity.toString(),
    });

    try {
      return await this.dishIngredientRepo.save(dishIngredient);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async update(
    tenantId: string,
    dishId: string,
    id: string,
    dto: UpdateDishIngredientDto,
  ): Promise<DishIngredient> {
    const dishIngredient = await this.findOne(tenantId, dishId, id);
    dishIngredient.quantity = dto.quantity.toString();
    return this.dishIngredientRepo.save(dishIngredient);
  }

  async remove(tenantId: string, dishId: string, id: string): Promise<void> {
    const dishIngredient = await this.findOne(tenantId, dishId, id);
    await this.dishIngredientRepo.remove(dishIngredient);
  }

  private async findOne(
    tenantId: string,
    dishId: string,
    id: string,
  ): Promise<DishIngredient> {
    const dishIngredient = await this.dishIngredientRepo.findOne({
      where: { id, dishId, tenantId },
    });

    if (!dishIngredient) {
      throw new NotFoundException('Ingrediente de la receta no encontrado');
    }

    return dishIngredient;
  }

  private async assertDishExists(
    tenantId: string,
    dishId: string,
  ): Promise<void> {
    const exists = await this.dishRepo.existsBy({ id: dishId, tenantId });
    if (!exists) {
      throw new NotFoundException('Plato no encontrado');
    }
  }

  private async assertIngredientExists(
    tenantId: string,
    ingredientId: string,
  ): Promise<void> {
    const exists = await this.ingredientRepo.existsBy({
      id: ingredientId,
      tenantId,
    });
    if (!exists) {
      throw new BadRequestException(
        'El ingrediente indicado no existe en el tenant',
      );
    }
  }

  private handleUniqueViolation(error: unknown): unknown {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code === '23505'
    ) {
      return new ConflictException(
        'Ese ingrediente ya está asociado al plato',
      );
    }
    return error;
  }
}
