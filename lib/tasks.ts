import { sql } from '@vercel/postgres';
import { getDb } from "./db";

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  duedate?: Date | null;
  completedpomodoros?: number;
  workduration?: number;
  breakduration?: number;
}

export async function createTask(task: Task): Promise<Task> {
  await getDb();
  const result = await sql`
    INSERT INTO tasks (
      title, description, completed, priority, dueDate, 
      completedPomodoros, workDuration, breakDuration
    ) VALUES (
      ${task.title},
      ${task.description},
      ${task.completed},
      ${task.priority},
      ${task.duedate ? task.duedate.toISOString() : null},
      ${task.completedpomodoros},
      ${task.workduration},
      ${task.breakduration}
    )
    RETURNING *
  `;
  
  return result.rows[0] as Task;
}

export async function getAllTasks(): Promise<Task[]> {
  await getDb();
  const result = await sql`SELECT * FROM tasks`;
  return result.rows as Task[];
}

export async function getTaskById(id: number): Promise<Task | null> {
  await getDb();
  const result = await sql`SELECT * FROM tasks WHERE id = ${id}`;
  return result.rows[0] as Task | null;
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task | null> {
  await getDb();

  // Construct the SET clause based on the provided updates
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  if ('title' in updates) {
    setClauses.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }
  if ('description' in updates) {
    setClauses.push(`description = $${paramIndex}`);
    values.push(updates.description);
    paramIndex++;
  }
  if ('completed' in updates) {
    setClauses.push(`completed = $${paramIndex}`);
    values.push(updates.completed);
    paramIndex++;
  }
  if ('priority' in updates) {
    setClauses.push(`priority = $${paramIndex}`);
    values.push(updates.priority);
    paramIndex++;
  }
  if ('duedate' in updates) {
    setClauses.push(`duedate = $${paramIndex}`);
    values.push(updates.duedate);
    paramIndex++;
  }
  if ('completedpomodoros' in updates) {
    setClauses.push(`completedpomodoros = $${paramIndex}`);
    values.push(updates.completedpomodoros);
    paramIndex++;
  }
  if ('workduration' in updates) {
    setClauses.push(`workduration = $${paramIndex}`);
    values.push(updates.workduration);
    paramIndex++;
  }
  if ('breakduration' in updates) {
    setClauses.push(`breakduration = $${paramIndex}`);
    values.push(updates.breakduration);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    return null; // No updates provided
  }

  const setClause = setClauses.join(', ');
  values.push(id);

  const query = `
    UPDATE tasks
    SET ${setClause}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await sql.query(query, values);
  return result.rows[0] as Task | null;
}

export async function deleteTask(id: number): Promise<boolean> {
  await getDb();
  await sql`DELETE FROM tasks WHERE id = ${id}`;
  return true;
}
