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
            name: 'portfolio_id',
            type: 'int'
          },
          {
            name: 'quantity',
            type: 'float',
            default: 1000
          },
          {
            name: 'value',
            type: 'float'
          },
          {
            name: 'date',
            type: 'date'
          }
        ],
        foreignKeys: [
          {
            name: 'quotas_portfolio_id_fkey',
            columnNames: ['portfolio_id'],
            referencedTableName: 'portfolios',
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
