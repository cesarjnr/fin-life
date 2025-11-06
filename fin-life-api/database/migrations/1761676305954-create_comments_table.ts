import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCommentsTable1761676305954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'text',
            type: 'text'
          },
          {
            name: 'portfolio_asset_id',
            type: 'int'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'comments_portfolio_asset_id_fkey',
            columnNames: ['portfolio_asset_id'],
            referencedTableName: 'portfolios_assets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          {
            name: 'comments_portfolio_asset_id_idx',
            columnNames: ['portfolio_asset_id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comments');
  }
}
