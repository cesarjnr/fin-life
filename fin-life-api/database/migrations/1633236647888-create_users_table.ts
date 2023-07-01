import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createUsersTable1633236647888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            type: 'varchar',
            length: '50'
          },
          {
            name: 'email',
            type: 'varchar',
            length: '128',
            isUnique: true
          },
          {
            name: 'password',
            type: 'varchar',
            length: '60'
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
