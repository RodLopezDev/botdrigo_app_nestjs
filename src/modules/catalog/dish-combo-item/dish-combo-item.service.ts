import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Dish } from '../../../domain/entities/catalog/dish.entity';
import { DishComboItem } from '../../../domain/entities/catalog/dish-combo-item.entity';
import { CreateDishComboItemDto } from './dto/create-dish-combo-item.dto';
import { UpdateDishComboItemDto } from './dto/update-dish-combo-item.dto';

@Injectable()
export class DishComboItemService {
  constructor(
    @InjectRepository(DishComboItem)
    private readonly comboItemRepo: Repository<DishComboItem>,
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
  ) {}

  async findAll(
    tenantId: string,
    comboDishId: string,
  ): Promise<DishComboItem[]> {
    await this.assertDishExists(tenantId, comboDishId);
    return this.comboItemRepo.find({
      where: { tenantId, comboDishId },
      relations: { componentDish: true },
    });
  }

  async create(
    tenantId: string,
    comboDishId: string,
    dto: CreateDishComboItemDto,
  ): Promise<DishComboItem> {
    if (comboDishId === dto.componentDishId) {
      throw new BadRequestException(
        'Un combo no puede contenerse a sí mismo como componente',
      );
    }

    await this.assertDishExists(tenantId, comboDishId);
    await this.assertComponentExists(tenantId, dto.componentDishId);

    const comboItem = this.comboItemRepo.create({
      tenantId,
      comboDishId,
      componentDishId: dto.componentDishId,
      quantity: dto.quantity,
    });

    try {
      return await this.comboItemRepo.save(comboItem);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async update(
    tenantId: string,
    comboDishId: string,
    id: string,
    dto: UpdateDishComboItemDto,
  ): Promise<DishComboItem> {
    const comboItem = await this.findOne(tenantId, comboDishId, id);
    comboItem.quantity = dto.quantity;
    return this.comboItemRepo.save(comboItem);
  }

  async remove(
    tenantId: string,
    comboDishId: string,
    id: string,
  ): Promise<void> {
    const comboItem = await this.findOne(tenantId, comboDishId, id);
    await this.comboItemRepo.remove(comboItem);
  }

  private async findOne(
    tenantId: string,
    comboDishId: string,
    id: string,
  ): Promise<DishComboItem> {
    const comboItem = await this.comboItemRepo.findOne({
      where: { id, comboDishId, tenantId },
    });

    if (!comboItem) {
      throw new NotFoundException('Componente del combo no encontrado');
    }

    return comboItem;
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

  private async assertComponentExists(
    tenantId: string,
    dishId: string,
  ): Promise<void> {
    const exists = await this.dishRepo.existsBy({ id: dishId, tenantId });
    if (!exists) {
      throw new BadRequestException(
        'El plato componente no existe en el tenant',
      );
    }
  }

  private handleUniqueViolation(error: unknown): unknown {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code === '23505'
    ) {
      return new ConflictException(
        'Ese componente ya forma parte del combo',
      );
    }
    return error;
  }
}
