import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }

  // Use in-memory database for production, file-based for development
  const filename = process.env.NODE_ENV === 'production' ? ':memory:' : './mydb.sqlite';

  db = await open({
    filename,
    driver: sqlite3.Database
  });

  // If using in-memory database, set up your schema here
  if (process.env.NODE_ENV === 'production') {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        completed INTEGER,
        priority TEXT,
        dueDate TEXT,
        completedPomodoros INTEGER,
        workDuration INTEGER,
        breakDuration INTEGER
      )
    `);
  }

  return db;
}
