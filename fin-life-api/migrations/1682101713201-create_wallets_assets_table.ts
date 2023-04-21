import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createWalletsAssetsTable1682101713201 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'wallets_assets',
				columns: [
					{
						name: 'wallet_id',
						type: 'int',
						isPrimary: true
					},
					{
						name: 'asset_id',
						type: 'int',
						isPrimary: true
					},
					{
						name: 'area',
						type: 'varchar',
						isNullable: true
					},
					{
						name: 'characteristic',
						type: 'enum',
						enum: ['risk', 'growing', 'dividend', 'security']
					},
					{
						name: 'quantity',
						type: 'float'
					},
					{
						name: 'expected_percentage',
						type: 'int',
						isNullable: true
					},
					{
						name: 'total_value',
						type: 'float'
					}
				]
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('wallets_assets')
	}
}
