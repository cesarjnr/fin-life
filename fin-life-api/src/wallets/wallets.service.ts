import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wallet } from './wallet.entity';
import { UsersService } from '../users/users.service';
import { CreateWalletDto } from './wallets.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private readonly walletsRepository: Repository<Wallet>,
    private readonly usersService: UsersService
  ) {}

  public async create(userId: number, createWalletDto: CreateWalletDto): Promise<Wallet> {
    const user = await this.usersService.findUser(userId);
    const { numberOfQuotas } = createWalletDto;
    const wallet = new Wallet(numberOfQuotas, user);

    await this.walletsRepository.save(wallet);

    return wallet;
  }

  public async find(walletId: number): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({ id: walletId });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }
}
