import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQuotasTable1689550177979 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'quotas',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'wallet_id',
            type: 'int'
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'quantity',
            type: 'float'
          },
          {
            name: 'value',
            type: 'int'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'quotas_wallet_id_fkey',
            columnNames: ['wallet_id'],
            referencedTableName: 'wallets',
            referencedColumnNames: ['id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quotas');
  }
}
