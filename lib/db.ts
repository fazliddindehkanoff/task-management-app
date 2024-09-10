import { sql } from '@vercel/postgres';

let isDbInitialized = false;

export async function getDb(): Promise<void> {
  if (isDbInitialized) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      priority TEXT,
      dueDate TIMESTAMP,
      completedPomodoros INTEGER DEFAULT 0,
      workDuration INTEGER DEFAULT 25,
      breakDuration INTEGER DEFAULT 5
    )
  `;

  isDbInitialized = true;
}