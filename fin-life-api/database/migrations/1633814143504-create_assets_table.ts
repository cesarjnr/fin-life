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
            name: 'ticker',
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
            type: 'varchar'
          },
          {
            name: 'active',
            type: 'bool',
            default: true
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assets');
  }
}
