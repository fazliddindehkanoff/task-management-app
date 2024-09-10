import { getDb } from './db';

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  return db.all('SELECT * FROM tasks');
}

export async function getTaskById(id: number): Promise<Task | null> {
  const db = await getDb();
  return db.get('SELECT * FROM tasks WHERE id = ?', id);
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO tasks (title, description, completed, priority, dueDate, completedPomodoros, workDuration, breakDuration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.title, task.description, task.completed ? 1 : 0, task.priority, task.dueDate?.toISOString(), task.completedPomodoros, task.workDuration, task.breakDuration]
  );
  return { ...task, id: result.lastID };
}

export async function updateTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE tasks SET title = ?, description = ?, completed = ?, priority = ?, dueDate = ?, completedPomodoros = ?, workDuration = ?, breakDuration = ?
     WHERE id = ?`,
    [task.title, task.description, task.completed ? 1 : 0, task.priority, task.dueDate?.toISOString(), task.completedPomodoros, task.workDuration, task.breakDuration, task.id]
  );
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.run('DELETE FROM tasks WHERE id = ?', id);
}
