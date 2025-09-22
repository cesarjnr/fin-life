import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createAssetHistoricalPricesTable1684447559123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'asset_historical_prices',
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
            name: 'closing_price',
            type: 'decimal'
          }
        ],
        foreignKeys: [
          {
            name: 'asset_historical_prices_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      })
    );
    await queryRunner.query(`
      CREATE INDEX asset_historical_prices_asset_id_date_idx
      ON asset_historical_prices (asset_id ASC, date DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('asset_historical_prices');
  }
}
