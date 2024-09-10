import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import { open } from 'sqlite';

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './tasks.sqlite',
      driver: sqlite3.Database
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN NOT NULL DEFAULT 0,
        priority TEXT NOT NULL,
        dueDate TEXT,
        completedPomodoros INTEGER NOT NULL DEFAULT 0,
        workDuration INTEGER NOT NULL DEFAULT 0,
        breakDuration INTEGER NOT NULL DEFAULT 0
      )
    `);
  }
  return db;
}
