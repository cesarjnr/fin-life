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
            name: 'wallet_id',
            type: 'int'
          },
          {
            name: 'amount',
            type: 'int',
            comment: 'Quantity the user is buying/selling'
          },
          {
            name: 'price',
            type: 'float'
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['buy', 'sell']
          },
          {
            name: 'date',
            type: 'timestamp'
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
            name: 'buys_sells_wallet_id_fkey',
            columnNames: ['wallet_id'],
            referencedTableName: 'wallets',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'buys_sells_asset_id_wallet_id_idx',
            columnNames: ['asset_id', 'wallet_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('buys_sells');
  }
}
