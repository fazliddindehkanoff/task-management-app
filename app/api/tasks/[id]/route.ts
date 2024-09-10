import { NextResponse } from 'next/server'
import { getTaskById, updateTask, deleteTask } from '@/lib/tasks'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const task = await getTaskById(parseInt(params.id))
  if (task) {
    return NextResponse.json(task)
  } else {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const updates = await request.json();

  try {
    const updatedTask = await updateTask(id, updates);
    if (updatedTask) {
      return NextResponse.json(updatedTask);
    } else {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const task = await getTaskById(parseInt(params.id))
  if (task) {
    await deleteTask(parseInt(params.id))
    return NextResponse.json({ message: 'Task deleted' })
  } else {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
}
