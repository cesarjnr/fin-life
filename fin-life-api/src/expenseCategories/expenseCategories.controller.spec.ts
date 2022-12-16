import * as faker from 'faker';
import { Test } from '@nestjs/testing';

import { ExpenseCategoriesController } from './expenseCategories.controller';
import { ExpenseCategoriesService } from './expenseCategories.service';

describe('ExpenseCategoriesController', () => {
  let mockExpenseCategoriesService: jest.Mocked<ExpenseCategoriesService>;
  let expenseCategoriesController: ExpenseCategoriesController;
  const userId = faker.datatype.number(100);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ExpenseCategoriesController],
      providers: [
        {
          provide: ExpenseCategoriesService,
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
            update: jest.fn()
          }
        }
      ]
    }).compile();

    mockExpenseCategoriesService = moduleRef.get<ExpenseCategoriesService>(
      ExpenseCategoriesService
    ) as jest.Mocked<ExpenseCategoriesService>;
    expenseCategoriesController = moduleRef.get<ExpenseCategoriesController>(ExpenseCategoriesController);
  });

  describe('create', () => {
    it('should call the service method with the correct params', async () => {
      const body = {
        description: faker.lorem.paragraph(),
        revenuePercentage: faker.datatype.number(100)
      };

      await expenseCategoriesController.create(String(userId), body);

      expect(mockExpenseCategoriesService.create).toHaveBeenCalledWith({ ...body, userId });
    });
  });

  describe('get', () => {
    it('should call the service method with the correct params', async () => {
      await expenseCategoriesController.get(String(userId));

      expect(mockExpenseCategoriesService.get).toHaveBeenCalledWith({ userId });
    });
  });

  describe('update', () => {
    it('shoud call the service method with the correct params', async () => {
      const expenseCategoryId = faker.datatype.number(100);
      const body = {
        description: faker.lorem.paragraph(),
        revenuePercentage: faker.datatype.number(100)
      };

      await expenseCategoriesController.update(String(userId), String(expenseCategoryId), body);

      expect(mockExpenseCategoriesService.update).toHaveBeenCalledWith(userId, expenseCategoryId, body);
    });
  });
});
