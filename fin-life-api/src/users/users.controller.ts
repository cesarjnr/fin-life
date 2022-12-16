import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

import { UsersService, CreateUserDto } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
