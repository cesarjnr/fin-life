import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createPortfoliosAssetsTable1682101713201 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'portfolios_assets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'asset_id',
            type: 'int'
          },
          {
            name: 'portfolio_id',
            type: 'int'
          },
          {
            name: 'cost',
            type: 'float'
          },
          {
            name: 'average_cost',
            type: 'float'
          },
          {
            name: 'characteristic',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'expected_percentage',
            type: 'int',
            isNullable: true
          },
          {
            name: 'adjusted_cost',
            type: 'float'
          },
          {
            name: 'quantity',
            type: 'float'
          },
          {
            name: 'sales_total',
            type: 'float',
            default: 0
          },
          {
            name: 'last_split_date',
            type: 'date',
            isNullable: true
          },
          {
            name: 'dividends_paid',
            type: 'float',
            default: 0
          },
          {
            name: 'suggested_buy',
            comment: 'A suggested amount to buy in case the asset drops above certain percentages',
            type: 'float',
            default: 0
          }
        ],
        foreignKeys: [
          {
            name: 'portfolios_assets_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          },
          {
            name: 'portfolios_assets_portfolio_id_fkey',
            columnNames: ['portfolio_id'],
            referencedTableName: 'portfolios',
            referencedColumnNames: ['id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('portfolios_assets');
  }
}
