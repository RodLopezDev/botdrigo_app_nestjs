import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Category } from '../../../domain/entities/catalog/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  findAll(tenantId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { tenantId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async create(tenantId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create({
      tenantId,
      name: dto.name,
      sortOrder: dto.sortOrder ?? 0,
    });

    try {
      return await this.categoryRepo.save(category);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(tenantId, id);

    Object.assign(category, {
      name: dto.name ?? category.name,
      sortOrder: dto.sortOrder ?? category.sortOrder,
    });

    try {
      return await this.categoryRepo.save(category);
    } catch (error) {
      throw this.handleUniqueViolation(error);
    }
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const category = await this.findOne(tenantId, id);
    await this.categoryRepo.remove(category);
  }

  private handleUniqueViolation(error: unknown): unknown {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code === '23505'
    ) {
      return new ConflictException(
        'Ya existe una categoría con ese nombre en el tenant',
      );
    }
    return error;
  }
}
