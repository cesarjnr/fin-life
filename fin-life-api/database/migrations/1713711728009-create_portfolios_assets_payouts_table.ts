import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePortfoliosAssetsPayoutsTable1713711728009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'portfolios_assets_payouts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'portfolio_asset_id',
            type: 'int'
          },
          {
            name: 'type',
            type: 'varchar'
          },
          {
            name: 'date',
            type: 'date'
          },
          // {
          //   name: 'dividend_historical_payment_id',
          //   type: 'int'
          // },
          {
            name: 'quantity',
            type: 'decimal'
          },
          {
            name: 'value',
            type: 'decimal'
          },
          {
            name: 'taxes',
            type: 'decimal',
            default: 0
          },
          {
            name: 'total',
            type: 'decimal'
          },
          {
            name: 'received_date_exchange_rate',
            type: 'decimal',
            default: 0
          },
          {
            name: 'withdrawal_date',
            type: 'date',
            isNullable: true
          },
          {
            name: 'withdrawal_date_exchange_rate',
            type: 'decimal',
            default: 0
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3'
          }
        ],
        foreignKeys: [
          {
            name: 'portfolios_assets_payouts_portfolio_asset_id_fkey',
            columnNames: ['portfolio_asset_id'],
            referencedTableName: 'portfolios_assets',
            referencedColumnNames: ['id']
          }
          // {
          //   name: 'portfolios_assets_payouts_dividend_historical_payment_id_fkey',
          //   columnNames: ['dividend_historical_payment_id'],
          //   referencedTableName: 'dividend_historical_payments',
          //   referencedColumnNames: ['id']
          // }
        ],
        indices: [
          {
            name: 'portfolios_assets_payouts_portfolio_asset_id_idx',
            columnNames: ['portfolio_asset_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('portfolios_assets_payouts');
  }
}
