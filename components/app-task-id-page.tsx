'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlayCircle, PauseCircle, RotateCcw, CheckCircle2, Clock, CalendarIcon, ChevronLeft, Settings, X } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '../hooks/use-toast'
import { Progress } from "@/components/ui/progress"

export function AppTaskIdPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [time, setTime] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [breakSound, setBreakSound] = useState<BreakSound>('rain')
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)
  const breakAudioRef = useRef<HTMLAudioElement | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch task')
        }
        const taskData: Task = await response.json()
        setTask(taskData)
        setTime(taskData.workduration * 60)
        setIsBreak(false)
      } catch (error) {
        console.error('Error fetching task:', error)
        setTask(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [params.id])

  useEffect(() => {
    const initAudio = () => {
      if (!notificationAudioRef.current) {
        notificationAudioRef.current = new Audio('/sounds/notification.mp3')
      }
      if (!breakAudioRef.current) {
        breakAudioRef.current = new Audio(`/sounds/break/${breakSound}.mp3`)
        breakAudioRef.current.loop = true
      }
    }

    // Initialize audio only on user interaction
    const handleUserInteraction = () => {
      initAudio()
      document.removeEventListener('click', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [breakSound])

  const updateTask = useCallback(async (updates: Partial<Task>) => {
    if (!task) return

    let updatedTask = { ...task, ...updates }

    // Adjust the date if it's being updated
    if (updates.duedate) {
      const date = new Date(updates.duedate)
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
      updatedTask.duedate = new Date(date.toISOString().split('T')[0])
    }

    setTask(updatedTask)

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      toast({
        title: "Task updated",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }, [task, params.id, toast])

  const handleMarkComplete = () => {
    if (task) {
      const newCompletedPomodoros = task.completed ? task.completedpomodoros : task.completedpomodoros + 1;
      updateTask({
        completed: !task.completed,
        completedpomodoros: newCompletedPomodoros
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0 && !isInitialMount.current) {
      if (notificationAudioRef.current) {
        notificationAudioRef.current.play().catch(e => console.error("Error playing notification sound:", e))
      }
      if (isBreak) {
        setTime(task?.workduration ? task.workduration * 60 : 25 * 60)
        setIsBreak(false)
        if (breakAudioRef.current) {
          breakAudioRef.current.pause()
        }
      } else {
        setTime(task?.breakduration ? task.breakduration * 60 : 5 * 60)
        setIsBreak(true)
        if (task) {
          updateTask({ completedpomodoros: task.completedpomodoros + 1 })
        }
      }
      setIsActive(false)
    }

    isInitialMount.current = false

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, isBreak, task, updateTask])

  const toggleTimer = () => {
    setIsActive(!isActive)
    if (isBreak) {
      if (isActive) {
        // Pause break music
        if (breakAudioRef.current) {
          breakAudioRef.current.pause()
        }
      } else {
        // Start break music
        if (breakAudioRef.current) {
          breakAudioRef.current.play().catch(e => console.error("Error playing break sound:", e))
        }
      }
    }
  }

  const resetTimer = () => {
    setTime(task?.workduration ? task.workduration * 60 : 25 * 60)
    setIsActive(false)
    setIsBreak(false)
    // Stop break music if it's playing
    if (breakAudioRef.current) {
      breakAudioRef.current.pause()
      breakAudioRef.current.currentTime = 0
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleBreakSoundChange = (value: BreakSound) => {
    setBreakSound(value)
    if (breakAudioRef.current) {
      breakAudioRef.current.pause()
      breakAudioRef.current.src = `/sounds/break/${value}.mp3`
      breakAudioRef.current.load() // Reload the audio with the new source
      if (isBreak && isActive) {
        breakAudioRef.current.play()
      }
    }
  }

  // Stop break sound when component unmounts
  useEffect(() => {
    return () => {
      if (breakAudioRef.current) {
        breakAudioRef.current.pause()
      }
    }
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (!task) return <div>Task not found</div>

  const progress = isBreak
    ? ((task.breakduration * 60 - time) / (task.breakduration * 60)) * 100
    : ((task.workduration * 60 - time) / (task.workduration * 60)) * 100

  return (
    <div className="flex h-screen relative">
      <div className={`w-full md:w-1/3 p-4 border-r overflow-y-auto absolute md:relative bg-background transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-0' : '-left-full md:left-0'} z-10`}>
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')} 
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Task List
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <div>
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={task.title}
              onChange={(e) => updateTask({ title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={task.description}
              onChange={(e) => updateTask({ description: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="priority" className="text-sm font-medium">Priority</label>
            <Select
              value={task.priority}
              onValueChange={(value: Priority) => updateTask({ priority: value })}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {task.duedate ? format(new Date(task.duedate), 'PPP') : <span>Pick a due date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.duedate ? new Date(task.duedate) : undefined}
                  onSelect={(date) => updateTask({ duedate: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">Pomodoro Settings</h3>
            <div className="mt-2 space-y-2">
              <div>
                <label htmlFor="workDuration" className="text-sm font-medium">Work Duration (minutes)</label>
                <Input
                  id="workDuration"
                  type="number"
                  value={task.workduration}
                  onChange={(e) => updateTask({ workduration: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="breakDuration" className="text-sm font-medium">Break Duration (minutes)</label>
                <Input
                  id="breakDuration"
                  type="number"
                  value={task.breakduration}
                  onChange={(e) => updateTask({ breakduration: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">Break Sound</h3>
            <Select value={breakSound} onValueChange={handleBreakSoundChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select break sound" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rain">Rain</SelectItem>
                <SelectItem value="waves">Waves</SelectItem>
                <SelectItem value="birds">Birds</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-4 left-4 md:hidden"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="mb-8">
          <Progress 
            value={progress} 
            className="h-4 w-80"
          />
        </div>
        <div className="text-8xl font-bold mb-4 relative">
          <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-sm">
            {isBreak ? 'Break' : 'Work'}
          </span>
          {formatTime(time)}
        </div>
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleTimer}
          >
            {isActive ? <PauseCircle className="h-6 w-6 mr-2" /> : <PlayCircle className="h-6 w-6 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
          >
            <RotateCcw className="h-6 w-6 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleMarkComplete}
          >
            <CheckCircle2 className="h-6 w-6 mr-2" />
            {task.completed ? 'Incomplete' : 'Complete'}
          </Button>
        </div>
        <Badge variant="outline" className="text-lg p-2">
          <Clock className="mr-2 h-5 w-5" />
          Completed Pomodoros: {task.completedpomodoros}
        </Badge>
      </div>
    </div>
  )
}