import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

export const dataSource = new DataSource({
  database: configService.get('TYPEORM_DATABASE'),
  entities: ['dist/**/*.entity.js'],
  host: configService.get('TYPEORM_HOST'),
  logging: configService.get('TYPEORM_LOGGING') === 'true',
  migrations: ['dist/migrations/*.js'],
  password: configService.get('TYPEORM_PASSWORD'),
  port: Number(configService.get('TYPEORM_PORT')),
  synchronize: configService.get('TYPEORM_SYNCHRONIZE') === 'true',
  type: 'postgres',
  username: configService.get('TYPEORM_USERNAME')
});
