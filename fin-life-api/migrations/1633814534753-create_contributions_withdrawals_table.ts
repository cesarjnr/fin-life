import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createContributionsWithdrawalsTable1633814534753
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contributions_withdrawals',
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
            name: 'asset_id',
            type: 'int'
          },
          {
            name: 'quantity',
            type: 'int',
            comment: 'Quantity the user is buying/selling'
          },
          {
            name: 'value',
            type: 'float'
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['contribution', 'withdrawal']
          },
          {
            name: 'number_of_quotas',
            type: 'int',
            comment: 'Number of quotas after the contribution/withdrawal'
          },
          {
            name: 'date',
            type: 'timestamp'
          }
        ],
        foreignKeys: [
          {
            name: 'contributions_withdrawals_user_id_fkey',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id']
          },
          {
            name: 'contributions_withdrawals_asset_id_fkey',
            columnNames: ['asset_id'],
            referencedTableName: 'assets',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'contributions_withdrawals_user_id_asset_id_idx',
            columnNames: ['user_id', 'asset_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contributions_withdrawals');
  }
}
