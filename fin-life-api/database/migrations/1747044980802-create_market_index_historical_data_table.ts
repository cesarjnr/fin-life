import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMarketIndexHistoricalDataTable1747044980802 implements MigrationInterface {
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
            name: 'interval',
            type: 'varchar'
          },
          {
            name: 'ticker',
            type: 'varchar'
          },
          {
            name: 'type',
            type: 'varchar'
          },
          {
            name: 'value',
            type: 'decimal'
          }
        ],
        indices: [
          {
            name: 'market_index_historical_data_ticker_date_idx',
            columnNames: ['ticker', 'date']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('market_index_historical_data');
  }
}
