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
            name: 'code',
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
        ]
      })
    );
    await queryRunner.query(`
      CREATE INDEX market_index_historical_data_code_date_idx
      ON market_index_historical_data (code ASC, date DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('market_index_historical_data');
  }
}
