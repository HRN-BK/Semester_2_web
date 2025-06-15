"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Clock, BookOpen, Calendar as CalendarIcon, Filter, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

type Session = {
  id: string
  subject: string
  duration: string
  date: string
  notes?: string
  subjectColor: string
  subjects?: { name: string }[]
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          duration,
          date,
          notes,
          subjects (name)
        `)
      if (error) {
        console.error('Error fetching sessions:', error)
        toast.error("Không thể tải danh sách phiên học")
      } else {
        console.log('Raw sessions data:', data) // Debug data
        const formattedSessions = data.map((session) => ({
          ...session,
          subject: session.subjects?.[0]?.name || 'Unknown',
          subjectColor: getRandomColor(),
        }))
        setSessions(formattedSessions)
      }
    }
    fetchSessions()
  }, [])

  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleDelete = async () => {
    if (!sessionToDelete) {
      toast.error("Không có phiên học để xóa")
      return
    }

    console.log('Deleting session ID:', sessionToDelete) // Debug ID
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user?.id) // Debug user

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionToDelete)

    if (error) {
      console.error('Supabase delete error:', error.message, error.details, error.hint)
      toast.error(`Không thể xóa: ${error.message}`)
    } else {
      setSessions(sessions.filter((s) => s.id !== sessionToDelete))
      toast.success("Xóa phiên học thành công")
    }

    setOpenDialog(false)
    setSessionToDelete(null)
  }

  const totalDuration = sessions.reduce((total, session) => {
    const hours = parseFloat(session.duration) || 0
    return total + hours
  }, 0)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phiên học</h1>
          <p className="text-muted-foreground">
            Xem và quản lý các phiên học của bạn
          </p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm phiên học
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thời gian</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration.toFixed(1)} giờ</div>
            <p className="text-xs text-muted-foreground">
              {sessions.length} phiên học
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Môn học</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sessions.map(s => s.subject)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Môn đã học
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngày học gần nhất</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hôm nay</div>
            <p className="text-xs text-muted-foreground">
              {sessions.filter(s => s.date.includes('Hôm nay')).length} phiên
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian trung bình</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalDuration / sessions.length || 0).toFixed(1)}h/phiên
            </div>
            <p className="text-xs text-muted-foreground">
              Trung bình mỗi phiên
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Lịch sử học tập</CardTitle>
              <CardDescription>Tất cả các phiên học của bạn</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Lọc
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-1 rounded-full ${session.subjectColor}`} />
                  <div>
                    <p className="font-medium">{session.subject}</p>
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{session.duration}</p>
                  <p className="text-sm text-muted-foreground">{session.date}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-2"
                    onClick={() => {
                      console.log('Session ID:', session.id) // Debug ID
                      setSessionToDelete(session.id)
                      setOpenDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phiên học</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa phiên học này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
