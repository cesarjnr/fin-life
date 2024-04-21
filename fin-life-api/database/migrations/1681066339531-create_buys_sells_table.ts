import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createBuysSellsTable1681066339531 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'buys_sells',
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
            name: 'quantity',
            type: 'float',
            comment: 'Quantity the user is buying/selling'
          },
          {
            name: 'price',
            type: 'float'
          },
          {
            name: 'fees',
            type: 'float',
            isNullable: true
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['buy', 'sell']
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'institution',
            type: 'varchar'
          }
        ],
        foreignKeys: [
          {
            name: 'buys_sells_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          },
          {
            name: 'buys_sells_portfolio_id_fkey',
            columnNames: ['portfolio_id'],
            referencedTableName: 'portfolios',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'buys_sells_asset_id_portfolio_id_idx',
            columnNames: ['asset_id', 'portfolio_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('buys_sells');
  }
}
