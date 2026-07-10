import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const isCompiled = __filename.endsWith('.js');

const sslMode = process.env.DB_SSL_MODE?.toLowerCase();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'botdrigo',
  ssl:
    sslMode === 'require' || sslMode === 'true'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [isCompiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [isCompiled ? 'dist/migrations/*.js' : 'migrations/*.ts'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
