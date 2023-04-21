import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RevenuesController } from './revenues.controller';
import { Revenue } from './revenue.entity';
import { UsersModule } from '../users/users.module';
import { RevenuesService } from './revenues.service';

@Module({
  controllers: [RevenuesController],
  imports: [TypeOrmModule.forFeature([Revenue]), UsersModule],
  providers: [RevenuesService]
})
export class RevenuesModule {}
