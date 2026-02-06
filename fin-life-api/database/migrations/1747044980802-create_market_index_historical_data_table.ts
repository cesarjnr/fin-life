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
            name: 'market_index_id',
            type: 'int'
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'value',
            type: 'decimal'
          }
        ],
        foreignKeys: [
          {
            name: 'market_index_historical_data_market_index_id_fkey',
            columnNames: ['market_index_id'],
            referencedTableName: 'market_indexes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      })
    );
    await queryRunner.query(`
      CREATE INDEX market_index_historical_data_market_index_id_date_idx
      ON market_index_historical_data (market_index_id ASC, date DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('market_index_historical_data');
  }
}
