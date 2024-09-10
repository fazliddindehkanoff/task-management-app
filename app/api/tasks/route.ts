import { NextResponse } from 'next/server'
import { createTask, getAllTasks } from '@/lib/tasks'

export async function POST(request: Request) {
  const tasks = await request.json()
  await createTask(tasks[0])
  return NextResponse.json({ message: 'Tasks saved successfully' })
}

export async function GET() {
  const tasks = await getAllTasks()
  return NextResponse.json(tasks)
}
