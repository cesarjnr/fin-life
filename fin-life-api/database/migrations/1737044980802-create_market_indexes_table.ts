import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMarketIndexesTable1737044980802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'market_indexes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'interval',
            type: 'varchar'
          },
          {
            name: 'type',
            type: 'varchar'
          },
          {
            name: 'active',
            type: 'bool',
            default: true
          },
          {
            name: 'all_time_high_value',
            type: 'decimal',
            default: 0
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('market_indexes');
  }
}
