import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePortfoliosAssetsDividendsTable1713711728009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'portfolios_assets_dividends',
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
            name: 'dividend_historical_payment_id',
            type: 'int'
          },
          {
            name: 'shares_amount',
            type: 'float'
          },
          {
            name: 'value',
            type: 'decimal'
          },
          {
            name: 'total',
            type: 'decimal'
          }
        ],
        foreignKeys: [
          {
            name: 'portfolios_assets_dividends_portfolio_asset_id_fkey',
            columnNames: ['portfolio_asset_id'],
            referencedTableName: 'portfolios_assets',
            referencedColumnNames: ['id']
          },
          {
            name: 'portfolios_assets_dividends_dividend_historical_payment_id_fkey',
            columnNames: ['dividend_historical_payment_id'],
            referencedTableName: 'dividend_historical_payments',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'portfolios_assets_dividends_portfolio_asset_id_idx',
            columnNames: ['portfolio_asset_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('portfolios_assets_dividends');
  }
}
