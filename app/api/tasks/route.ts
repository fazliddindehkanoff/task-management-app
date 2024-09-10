import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const tasks = await request.json()
  const filePath = path.join(process.cwd(), 'tasks.json')
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
  return NextResponse.json({ message: 'Tasks saved successfully' })
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'tasks.json')
  const tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return NextResponse.json(tasks)
}
