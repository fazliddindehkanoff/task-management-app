import { NextResponse } from 'next/server'
import { createTask, getAllTasks } from '@/lib/tasks'

export async function POST(request: Request) {
  const tasks = await request.json()
  let createdTask = await createTask(tasks)
  return NextResponse.json(createdTask)
}

export async function GET() {
  const tasks = await getAllTasks()
  return NextResponse.json(tasks)
}
