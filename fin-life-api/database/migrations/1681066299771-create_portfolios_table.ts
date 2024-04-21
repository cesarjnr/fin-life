import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createPortfoliosTable1681066299771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'portfolios',
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
          }
        ],
        foreignKeys: [
          {
            name: 'portfolios_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'portfolios_user_id_fkey',
            columnNames: ['user_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('portfolios');
  }
}
