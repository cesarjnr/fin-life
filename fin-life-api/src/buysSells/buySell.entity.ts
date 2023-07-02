import { AfterLoad, BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from '../assets/asset.entity';
import { Wallet } from '../wallets/wallet.entity';

export enum BuySellTypes {
  Buy = 'buy',
  Sell = 'sell'
}

@Index('buys_sells_asset_id_wallet_id_idx', ['assetId', 'walletId'])
@Entity('buys_sells')
export class BuySell {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'enum', enum: BuySellTypes })
  type: BuySellTypes;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @ManyToOne(() => Asset, (asset) => asset.buysSells)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'buys_sells_asset_id_fkey' })
  asset?: Asset;

  @ManyToOne(() => Wallet, (wallet) => wallet.buysSells)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'buys_sells_wallet_id_fkey' })
  wallet?: Wallet;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.price = Number((Number(this.price.toFixed(2)) * 100).toFixed(2));
  }

  @AfterLoad()
  public convertValueToReais(): void {
    this.price = this.price / 100;
  }

  constructor(amount: number, price: number, type: BuySellTypes, date: string, assetId: number, walletId: number) {
    this.amount = amount;
    this.price = price;
    this.type = type;
    this.date = date;
    this.assetId = assetId;
    this.walletId = walletId;
  }
}
