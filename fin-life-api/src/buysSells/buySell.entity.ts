import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Asset } from '../assets/asset.entity';
import { Wallet } from '../wallets/wallet.entity';

export enum BuySellType {
  Buy = 'buy',
  Sell = 'sell'
}

@Entity('buys_sells')
export class BuySell {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  amount: number;

  @Column()
  price: number;

  @Column()
  type: BuySellType;

  @Column()
  date: Date;

  @ManyToOne(() => Asset, (asset) => asset.buysSells)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset | number;

  @ManyToOne(() => Wallet, (wallet) => wallet.buysSells)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet | number;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.price = this.price * 100;
  }

  @AfterLoad()
  public convertValueToReais(): void {
    this.price = this.price / 100;
  }

  constructor(
    amount: number,
    price: number,
    type: BuySellType,
    date: Date,
    asset: Asset | number,
    wallet: Wallet | number
  ) {
    this.amount = amount;
    this.price = price;
    this.type = type;
    this.date = date;
    this.asset = asset;
    this.wallet = wallet;
  }
}
