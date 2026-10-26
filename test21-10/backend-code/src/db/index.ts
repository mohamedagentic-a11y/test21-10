import { Pool, QueryResult, QueryResultRow } from 'pg';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('CRITICAL: Missing required database configuration environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
  process.exit(1);
}

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};