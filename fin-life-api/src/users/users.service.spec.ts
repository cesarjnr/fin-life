import * as faker from 'faker';
import { hash } from 'bcrypt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

import { User } from './user.entity';
import { UsersService, CreateUserDto } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  const mockHashFn = hash as jest.MockedFunction<typeof hash>;
  let mockUsersRepository: jest.Mocked<Repository<User>>;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn()
          }
        },
        UsersService
      ]
    }).compile();

    mockUsersRepository = moduleRef.get<jest.Mocked<Repository<User>>>(getRepositoryToken(User));
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const hash = faker.git.commitSha();
    const createUserDto: CreateUserDto = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(16)
    };

    beforeEach(() => {
      mockHashFn.mockImplementation(() => Promise.resolve(hash));
    });

    it('should throw a ConflictException when the given email already exists', async () => {
      const thrownError = new ConflictException('Email already exists');
      const existingUser: User = {
        id: faker.datatype.number(100),
        name: faker.name.findName(),
        email: createUserDto.email,
        password: faker.internet.password(10),
        expenseCategories: []
      };

      mockUsersRepository.findOne.mockResolvedValue(existingUser);

      await expect(usersService.create(createUserDto)).rejects.toStrictEqual(thrownError);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        email: createUserDto.email
      });
      expect(mockHashFn).not.toHaveBeenCalled();
      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });

    it('should create a user', async () => {
      const newUserId = faker.datatype.number(100);

      mockUsersRepository.save.mockImplementation((user: User) => {
        user.id = newUserId;

        return Promise.resolve(user);
      });

      const newUser = await usersService.create(createUserDto);

      expect(newUser).toEqual({
        ...createUserDto,
        id: newUserId,
        password: hash
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        email: createUserDto.email
      });
      expect(mockHashFn).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });
  });
});
