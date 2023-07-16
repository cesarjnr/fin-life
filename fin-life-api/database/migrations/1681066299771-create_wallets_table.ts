import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createWalletsTable1681066299771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'user_id',
            type: 'int'
          },
          {
            name: 'description',
            type: 'varchar'
          },
          {
            name: 'number_of_quotas',
            type: 'float',
            default: 100
          },
          {
            name: 'quota_initial_value',
            type: 'int',
            isNullable: true
          },
          {
            name: 'quota_initial_value',
            type: 'int'
          },
          {
            name: 'wallet_initial_value',
            type: 'int'
          }
        ],
        foreignKeys: [
          {
            name: 'wallets_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'wallets_user_id_fkey',
            columnNames: ['user_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wallets');
  }
}
