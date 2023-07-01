import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createRevenuesTable1682087031325 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'revenues',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'user_id',
            type: 'int'
          },
          {
            name: 'description',
            type: 'varchar'
          },
          {
            name: 'value',
            type: 'int'
          },
          {
            name: 'date',
            type: 'date'
          },
          {
            name: 'source',
            type: 'varchar'
          },
          {
            name: 'destiny_institution',
            type: 'varchar',
            comment: 'Institution where the amount has been received'
          }
        ],
        foreignKeys: [
          {
            name: 'revenues_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'revenues_user_id_idx',
            columnNames: ['user_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('revenues');
  }
}
