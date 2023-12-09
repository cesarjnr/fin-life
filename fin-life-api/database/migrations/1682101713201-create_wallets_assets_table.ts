import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createWalletsAssetsTable1682101713201 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets_assets',
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
            name: 'area',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'average_cost',
            type: 'float'
          },
          {
            name: 'characteristic',
            type: 'enum',
            enum: ['risk', 'growing', 'dividend', 'security'],
            isNullable: true
          },
          {
            name: 'expected_percentage',
            type: 'int',
            isNullable: true
          },
          {
            name: 'position',
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
          }
        ],
        foreignKeys: [
          {
            name: 'wallets_assets_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          },
          {
            name: 'wallets_assets_wallet_id_fkey',
            columnNames: ['wallet_id'],
            referencedTableName: 'wallets',
            referencedColumnNames: ['id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wallets_assets');
  }
}
