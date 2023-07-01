import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';

import { User } from './user.entity';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;

    await this.checkIfUserAlreadyExists(email);

    const hash = await this.generateHash(password);
    const newUser = new User(name, email, hash);

    await this.usersRepository.save(newUser);

    return newUser;
  }

  public async findUser(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['expenseCategories'] });

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

  private async generateHash(password: string): Promise<string> {
    const rounds = 10;

    return await hash(password, rounds);
  }
}
