import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createAssetsTable1633814143504 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'assets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'name',
            type: 'varchar'
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'category',
            type: 'varchar'
          },
          {
            name: 'class',
            type: 'varchar'
          },
          {
            name: 'sector',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'active',
            type: 'bool',
            default: true
          },
          {
            name: 'all_time_high_price',
            type: 'decimal',
            default: 0
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assets');
  }
}
