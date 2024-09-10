
type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  completedPomodoros: number;
  workDuration: number;
  breakDuration: number;
}