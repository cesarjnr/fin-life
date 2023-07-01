import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createExpenseCategoriesTable1633812328038 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'expense_categories',
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
            name: 'revenue_percentage',
            type: 'int',
            isNullable: true,
            comment: 'Percentage this category will take up in the total calculated revenue'
          }
        ],
        foreignKeys: [
          {
            name: 'expense_categories_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'expense_categories_user_id_fkey',
            columnNames: ['user_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('expense_categories');
  }
}
