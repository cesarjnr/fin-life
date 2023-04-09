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
            length: '5',
            isUnique: true
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['variable_income', 'fixed_income']
          },
          {
            name: 'class',
            type: 'enum',
            enum: ['stock', 'international', 'real_state', 'cash', 'cryptocurrency']
          },
          {
            name: 'area',
            type: 'varchar',
            length: '128',
            isNullable: true
          },
          {
            name: 'characteristic',
            type: 'enum',
            enum: ['risk', 'growing', 'dividend', 'security']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assets');
  }
}
