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
            type: 'int'
          }
        ],
        foreignKeys: [
          {
            name: 'asset_historical_prices_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'asset_historical_prices_asset_id_date_idx',
            columnNames: ['asset_id', 'date']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('asset_historical_prices');
  }
}
