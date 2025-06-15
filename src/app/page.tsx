"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BookOpen, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

type Session = {
  id: string
  subject: string
  duration: string
  date: string
  notes?: string
}

type Task = {
  id: string
  title: string
  subject: string
  due_date: string
}

type Subject = {
  id: string
  name: string
  credits: number
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)

  useEffect(() => {
    async function fetchData() {
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          duration,
          date,
          notes,
          subjects (name)
        `)
        .limit(5)
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
      } else {
        const formattedSessions = sessionsData.map((session) => ({
          ...session,
          subject: session.subjects[0].name || 'Unknown',
        }))
        setSessions(formattedSessions)

        // Calculate total duration
        const duration = formattedSessions.reduce((total, session) => {
          const match = session.duration.match(/(\d+)h\s*(\d+)m/)
          if (match) {
            const hours = parseInt(match[1])
            const minutes = parseInt(match[2])
            return total + hours + minutes / 60
          }
          return total
        }, 0)
        setTotalDuration(duration)
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          due_date,
          subjects (name)
        `)
        .limit(5)
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      } else {
        const formattedTasks = tasksData.map((task) => ({
          ...task,
          subject: task.subjects[0].name || 'Unknown',
        }))
        setTasks(formattedTasks)
      }

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, credits')
      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError)
      } else {
        setSubjects(subjectsData || [])
        const credits = subjectsData.reduce((total, subject) => total + (subject.credits || 0), 0)
        setTotalCredits(credits)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tổng quan</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giờ học</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration.toFixed(1)} giờ</div>
            <p className="text-xs text-muted-foreground">{sessions.length} phiên học</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tín chỉ</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">{subjects.length} môn học</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Công việc sắp đến hạn</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">Công việc cần hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phiên học gần đây</CardTitle>
            <CardDescription>Các phiên học mới nhất của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{session.subject}</p>
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{session.duration}</p>
                    <p className="text-sm text-muted-foreground">{session.date}</p>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có phiên học nào</p>
              )}
            </div>
            <Link href="/sessions" className="mt-4">
              <Button asChild variant="outline">Xem tất cả</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Công việc sắp đến hạn</CardTitle>
            <CardDescription>Các công việc cần hoàn thành</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.subject}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.due_date}</p>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có công việc nào</p>
              )}
            </div>
            <Link href="/tasks" className="mt-4">
              <Button asChild variant="outline">Xem tất cả</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Liên kết đến các trang con</CardTitle>
            <CardDescription>Các liên kết đến các trang con</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild variant="outline" className="mt-4">
                <Link href="/sessions">Phiên học</Link>
              </Button>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/tasks">Công việc</Link>
              </Button>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/subjects">Môn học</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}