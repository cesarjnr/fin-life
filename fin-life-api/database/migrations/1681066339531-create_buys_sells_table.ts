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
            type: 'decimal',
            comment: 'Quantity the user is buying/selling'
          },
          {
            name: 'price',
            type: 'decimal'
          },
          {
            name: 'fees',
            type: 'decimal',
            default: 0
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
            name: 'type',
            type: 'varchar'
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'institution',
            type: 'varchar'
          },
          {
            name: 'exchange_rate',
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
            name: 'buys_sells_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            name: 'buys_sells_portfolio_id_fkey',
            columnNames: ['portfolio_id'],
            referencedTableName: 'portfolios',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
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
