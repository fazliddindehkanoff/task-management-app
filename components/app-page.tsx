'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, Plus, Trash2, CheckCircle, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Priority = 'Low' | 'Medium' | 'High'

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

export function AppPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [newTask, setNewTask] = useState<Task>({
    id: Date.now(),
    title: '',
    description: '',
    completed: false,
    priority: 'Medium',
    dueDate: null,
    completedPomodoros: 0,
    workDuration: 25,
    breakDuration: 5
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const addTask = async () => {
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    setIsModalOpen(false)
    setNewTask({
      id: Date.now(),
      title: '',
      description: '',
      completed: false,
      priority: 'Medium',
      dueDate: null,
      completedPomodoros: 0,
      workDuration: 25,
      breakDuration: 5
    })

    // Save tasks to the server
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTasks),
      })
      if (!response.ok) {
        throw new Error('Failed to save tasks')
      }
    } catch (error) {
      console.error('Error saving tasks:', error)
      // You might want to show an error message to the user here
    }
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // If the delete was successful, update the local state
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      // You might want to show an error message to the user here
    }
  }

  const markAsCompleted = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ))
    // Add API call to update task on the server
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false
    if (filter === 'completed' && !task.completed) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  })

  const sortedAndFilteredTasks = filteredTasks.sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return sortOrder === 'asc' 
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    } else {
      if (!a.dueDate) return sortOrder === 'asc' ? 1 : -1;
      if (!b.dueDate) return sortOrder === 'asc' ? -1 : 1;
      return sortOrder === 'asc' 
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime();
    }
  });

  const totalPages = Math.ceil(filteredTasks.length / pageSize)
  const paginatedTasks = sortedAndFilteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const toggleSort = (newSortBy: 'priority' | 'dueDate') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, priorityFilter, pageSize])

  if (isLoading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-inherit">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="details"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Task Details
                </TabsTrigger>
                <TabsTrigger 
                  value="pomodoro"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Pomodoro Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      id="title"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      id="description"
                      placeholder="Task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: Priority) => setNewTask({...newTask, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          {newTask.dueDate ? format(newTask.dueDate, 'PPP') : <span>Pick a due date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate ? new Date(newTask.dueDate) : new Date()}
                          onSelect={(date) => setNewTask({...newTask, dueDate: date ? date.toISOString() : null})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="pomodoro">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="workDuration">Work Duration (minutes)</label>
                    <Input
                      id="workDuration"
                      type="number"
                      value={newTask.workDuration}
                      onChange={(e) => setNewTask({...newTask, workDuration: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="breakDuration">Break Duration (minutes)</label>
                    <Input
                      id="breakDuration"
                      type="number"
                      value={newTask.breakDuration}
                      onChange={(e) => setNewTask({...newTask, breakDuration: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button onClick={addTask} className="w-full">Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={filter} onValueChange={(value: 'all' | 'active' | 'completed') => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="active">Active Tasks</SelectItem>
            <SelectItem value="completed">Completed Tasks</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value: Priority | 'all') => setPriorityFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low Priority</SelectItem>
            <SelectItem value="Medium">Medium Priority</SelectItem>
            <SelectItem value="High">High Priority</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tasks per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('priority')}>
                Priority
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('dueDate')}>
                Due Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Pomodoros</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTasks.map(task => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span 
                    className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                    onClick={() => router.push(`/task/${task.id}`)}
                  >
                    {task.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.dueDate && (
                  <Badge variant="outline">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {format(task.dueDate, 'MMM d, yyyy')}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {task.completedPomodoros}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => markAsCompleted(task.id)} disabled={task.completed}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min(filteredTasks.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredTasks.length, currentPage * pageSize)} of {filteredTasks.length} tasks
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  onClick={() => setCurrentPage(i + 1)} 
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}