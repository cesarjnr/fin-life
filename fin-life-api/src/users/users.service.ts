import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { PasswordHelper } from '../common/helpers/password.helper';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface FindUserDto {
  id?: number;
  email?: string;
  relations?: string[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private passwordHelper: PasswordHelper
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;

    await this.checkIfUserAlreadyExists(email);

    const hash = await this.passwordHelper.generateHash(password);
    const newUser = new User(name, email, hash);

    await this.usersRepository.save(newUser);

    return newUser;
  }

  public async find(findUserDto: FindUserDto): Promise<User> {
    const { id, email, relations } = findUserDto;
    const where: FindOptionsWhere<User> = {};

    if (id) {
      where.id = findUserDto.id;
    }

    if (email) {
      where.email = findUserDto.email;
    }

    const user = await this.usersRepository.findOne({ where, relations });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async checkIfUserAlreadyExists(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      throw new ConflictException('Email already exists');
    }
  }
}
