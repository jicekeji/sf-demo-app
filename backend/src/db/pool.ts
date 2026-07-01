/**
 * Database access is expressed through the minimal `Db` interface so that the
 * repository and migration runner work against either a real node-postgres
 * Pool (production) or an in-memory pg-mem adapter (tests) unchanged.
 */
export interface QueryResult<Row = any> {
  rows: Row[];
  rowCount: number | null;
}

export interface Db {
  query<Row = any>(text: string, params?: unknown[]): Promise<QueryResult<Row>>;
}

let pool: Db | undefined;

/**
 * Lazily construct a node-postgres Pool from DATABASE_URL. Imported dynamically
 * so environments without a configured database (e.g. unit tests) never load
 * the driver.
 */
export async function getPool(): Promise<Db> {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — cannot connect to PostgreSQL');
  }
  const { Pool } = await import('pg');
  pool = new Pool({ connectionString }) as unknown as Db;
  return pool;
}

/** Test/DI hook to inject a specific Db implementation. */
export function setPool(db: Db | undefined): void {
  pool = db;
}
