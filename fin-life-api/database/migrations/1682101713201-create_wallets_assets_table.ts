import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createWalletsAssetsTable1682101713201 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets_assets',
        columns: [
          {
            name: 'asset_id',
            type: 'int',
            isPrimary: true
          },
          {
            name: 'wallet_id',
            type: 'int',
            isPrimary: true
          },
          {
            name: 'area',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'characteristic',
            type: 'enum',
            enum: ['risk', 'growing', 'dividend', 'security'],
            isNullable: true
          },
          {
            name: 'quantity',
            type: 'float'
          },
          {
            name: 'expected_percentage',
            type: 'int',
            isNullable: true
          },
          {
            name: 'cost',
            type: 'int'
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
