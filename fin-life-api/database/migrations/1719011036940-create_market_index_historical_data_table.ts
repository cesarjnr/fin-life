import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMarketIndexHistoricalDataTable1719011036940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'market_index_historical_data',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'ticker',
            type: 'varchar'
          },
          {
            name: 'interval',
            type: 'enum',
            enum: ['daily', 'monthly']
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['rate', 'point']
          },
          {
            name: 'value',
            type: 'float'
          }
        ],
        indices: [
          {
            name: 'market_index_historical_data_ticker_date_idx',
            columnNames: ['date', 'ticker']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('market_index_historical_data');
  }
}
