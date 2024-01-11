import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BuySell } from '../buysSells/buySell.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';
import { DividendHistoricalPayment } from '../dividendHistoricalPayments/dividendHistoricalPayment.entity';
import { SplitHistoricalEvent } from '../splitHistoricalEvents/splitHistoricalEvent.entity';

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncome = 'Renda Fixa'
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

  @Column()
  sector: string;

  @Column({ type: 'bool', default: false })
  active: boolean;

  @OneToMany(() => BuySell, (buySell) => buySell.asset)
  buysSells?: BuySell[];

  @OneToMany(() => AssetHistoricalPrice, (assetHistoricalPrice) => assetHistoricalPrice.asset)
  assetHistoricalPrices?: AssetHistoricalPrice[];

  @OneToMany(() => WalletAsset, (walletAsset) => walletAsset.asset)
  walletAssets?: WalletAsset[];

  @OneToMany(() => DividendHistoricalPayment, (dividendHistoricalPayment) => dividendHistoricalPayment.asset)
  dividendHistoricalPayments?: DividendHistoricalPayment[];

  @OneToMany(() => SplitHistoricalEvent, (splitHistoricalEvent) => splitHistoricalEvent.asset)
  splitHistoricalEvents?: SplitHistoricalEvent[];

  constructor(ticker: string, category: AssetCategories, assetClass: AssetClasses, sector: string) {
    this.ticker = ticker;
    this.category = category;
    this.class = assetClass;
    this.sector = sector;
  }
}
