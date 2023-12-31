import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDividendHistoricalPaymentsTable1703964235554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dividend_historical_payments',
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
            name: 'date',
            type: 'date'
          },
          {
            name: 'value',
            type: 'float'
          }
        ],
        foreignKeys: [
          {
            name: 'dividend_historical_payments_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'dividend_historical_payments_asset_id_date_idx',
            columnNames: ['asset_id', 'date']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dividend_historical_payments');
  }
}
