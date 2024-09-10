
type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  duedate: Date | null;
  completedpomodoros: number;
  workduration: number;
  breakduration: number;
}