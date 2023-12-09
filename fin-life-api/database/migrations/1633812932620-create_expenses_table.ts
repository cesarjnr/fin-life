import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createExpensesTable1633812932620 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'expenses',
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
            name: 'expense_category_id',
            type: 'int',
            isNullable: true
          },
          {
            name: 'description',
            type: 'varchar'
          },
          {
            name: 'value',
            type: 'float'
          },
          {
            name: 'counterpart',
            type: 'varchar',
            isNullable: true,
            comment: 'Who is paying the revenue or receiving the expense'
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['debit', 'credit', 'pix', 'money', 'bank_transfer'],
            isNullable: true
          },
          {
            name: 'payment_institution',
            type: 'varchar',
            isNullable: true,
            comment: 'Institution used to pay the expense'
          },
          {
            name: 'date',
            type: 'date'
          }
        ],
        foreignKeys: [
          {
            name: 'expenses_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          },
          {
            name: 'expenses_expense_category_id_fkey',
            columnNames: ['expense_category_id'],
            referencedTableName: 'expense_categories',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'expenses_user_id_expense_category_id_idx',
            columnNames: ['user_id', 'expense_category_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('expenses');
  }
}
