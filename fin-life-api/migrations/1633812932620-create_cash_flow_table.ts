import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createCashFlowTable1633812932620 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cash_flows',
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
            type: 'int'
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['revenue', 'expense']
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
            comment: 'Institution used to pay the expense or that sent the revenue'
          },
          {
            name: 'date',
            type: 'date'
          }
        ],
        foreignKeys: [
          {
            name: 'cash_flows_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          },
          {
            name: 'cash_flows_expense_category_id_fkey',
            columnNames: ['expense_category_id'],
            referencedTableName: 'expense_categories',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'cash_flows_user_id_expense_category_id_idx',
            columnNames: ['user_id', 'expense_category_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cash_flow');
  }
}
