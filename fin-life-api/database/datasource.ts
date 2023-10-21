import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

export const dataSource = new DataSource({
  database: configService.get('TYPEORM_DATABASE'),
  entities: [configService.get('TYPEORM_ENTITIES')],
  host: configService.get('TYPEORM_HOST'),
  logging: configService.get('TYPEORM_LOGGING') === 'true',
  migrations: [configService.get('TYPEORM_MIGRATIONS')],
  password: configService.get('TYPEORM_PASSWORD'),
  port: Number(configService.get('TYPEORM_PORT')),
  synchronize: configService.get('TYPEORM_SYNCHRONIZE') === 'true',
  type: 'postgres',
  username: configService.get('TYPEORM_USERNAME')
});
