import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'tasks.json')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const task = tasks.find((t: Task) => t.id === parseInt(params.id))
  
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
  const updatedTask = await request.json()
  const tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  const index = tasks.findIndex((t: Task) => t.id === parseInt(params.id))
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updatedTask }
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
    return NextResponse.json(tasks[index])
  } else {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const index = tasks.findIndex((t: Task) => t.id === parseInt(params.id))
  if (index !== -1) {
    tasks.splice(index, 1)
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
    return NextResponse.json({ message: 'Task deleted' })
  } else {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
}
