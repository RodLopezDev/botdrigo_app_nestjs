import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Ingredient } from '../../../domain/entities/catalog/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  findAll(tenantId: string): Promise<Ingredient[]> {
    return this.ingredientRepo.find({
      where: { tenantId, deleted: false },
      order: { name: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepo.findOne({
      where: { id, tenantId, deleted: false },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingrediente no encontrado');
    }

    return ingredient;
  }

  async create(
    tenantId: string,
    dto: CreateIngredientDto,
  ): Promise<Ingredient> {
    const ingredient = this.ingredientRepo.create({
      tenantId,
      name: dto.name,
      unit: dto.unit,
      costPerUnit: dto.costPerUnit.toString(),
      stockQuantity:
        dto.stockQuantity === undefined ? null : dto.stockQuantity.toString(),
      active: dto.active ?? true,
    });

    try {
      return await this.ingredientRepo.save(ingredient);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    const ingredient = await this.findOne(tenantId, id);

    if (dto.name !== undefined) ingredient.name = dto.name;
    if (dto.unit !== undefined) ingredient.unit = dto.unit;
    if (dto.costPerUnit !== undefined) {
      ingredient.costPerUnit = dto.costPerUnit.toString();
    }
    if (dto.stockQuantity !== undefined) {
      ingredient.stockQuantity = dto.stockQuantity.toString();
    }
    if (dto.active !== undefined) ingredient.active = dto.active;

    try {
      return await this.ingredientRepo.save(ingredient);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const ingredient = await this.findOne(tenantId, id);
    ingredient.deleted = true;
    await this.ingredientRepo.save(ingredient);
  }

  private handleUniqueViolation(error: unknown): unknown {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code === '23505'
    ) {
      return new ConflictException(
        'Ya existe un ingrediente con ese nombre en el tenant',
      );
    }
    return error;
  }
}
