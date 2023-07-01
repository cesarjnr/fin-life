import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BuySell } from '../buysSells/buySell.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';

export enum AssetCategories {
  VariableIncome = 'variable_income',
  FixedIncoe = 'fixed_income'
}

export enum AssetClasses {
  Stock = 'stock',
  International = 'international',
  RealState = 'real_state',
  Cash = 'cash',
  Cryptocurrency = 'cryptocurrency'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true, length: 5 })
  ticker: string;

  @Column({ type: 'enum', enum: AssetCategories })
  category: AssetCategories;

  @Column({ type: 'enum', enum: AssetClasses })
  class: AssetClasses;

  @OneToMany(() => BuySell, (buySell) => buySell.asset)
  buysSells?: BuySell[];

  @OneToMany(() => AssetHistoricalPrice, (assetHistoricalPrice) => assetHistoricalPrice.asset)
  assetHistoricalPrices?: AssetHistoricalPrice[];

  @OneToMany(() => WalletAsset, (walletAsset) => walletAsset.asset)
  walletAssets?: WalletAsset[];

  constructor(ticker: string, category: AssetCategories, assetClass: AssetClasses) {
    this.ticker = ticker;
    this.category = category;
    this.class = assetClass;
  }
}
