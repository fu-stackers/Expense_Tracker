import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  create(createExpenseDto: CreateExpenseDto) {
    const { title, amount, category, date } = createExpenseDto;

    return this.prisma.expense.create({
      data: {
        title,
        amount: new Prisma.Decimal(amount),
        category,
        ...(date ? { date: new Date(date) } : {}),
      },
    });
  }

  findAll(category?: string, startDate?: string, endDate?: string) {
    const where: Prisma.ExpenseWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(`${endDate}T23:59:59.999Z`) } : {}),
      };
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async findOne(id: number) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    if (Object.keys(updateExpenseDto).length === 0) {
      throw new BadRequestException('At least one field is required to update');
    }
    const { amount, date, ...rest } = updateExpenseDto;

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...rest,
        ...(amount !== undefined ? { amount: new Prisma.Decimal(amount) } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
  }

  async remove(id: number) {
    const expense = this.prisma.expense.delete({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async getTotalSpending() {
    const result = await this.prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    return {
      totalSpending: result._sum.amount ?? 0,
    };
  }
  async getSpendingByCategory() {
    const result = await this.prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true,
      },
    });
    return result;
  }
}
