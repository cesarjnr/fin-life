import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSplitHistoricalEventsTable1713712741697 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'split_historical_events',
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
            name: 'numerator',
            type: 'float'
          },
          {
            name: 'denominator',
            type: 'float'
          },
          {
            name: 'ratio',
            type: 'varchar'
          }
        ],
        foreignKeys: [
          {
            name: 'split_historical_events_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'split_historical_events_asset_id_idx',
            columnNames: ['asset_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('split_historical_events');
  }
}
