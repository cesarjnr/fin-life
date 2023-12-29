import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BuySell } from '../buysSells/buySell.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncoe = 'Renda Fixa'
}

export enum AssetClasses {
  Stock = 'Ações',
  International = 'Internacionais',
  RealState = 'Imobiliários',
  Cash = 'Caixa',
  Cryptocurrency = 'Criptomoedas'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  ticker: string;

  @Column()
  category: string;

  @Column()
  class: string;

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
