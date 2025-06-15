"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Pencil } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Subject = {
  id: string
  name: string
  credits: number
  created_at: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Không thể tải danh sách môn học')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setSubjectToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!subjectToDelete) return

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectToDelete)

      if (error) throw error

      // Update local state
      setSubjects(subjects.filter(subject => subject.id !== subjectToDelete))
      toast.success('Đã xoá môn học thành công')
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast.error('Không thể xoá môn học')
    } finally {
      setDeleteDialogOpen(false)
      setSubjectToDelete(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[200px]">Đang tải...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý môn học</h1>
          <p className="text-muted-foreground">
            Thêm, chỉnh sửa và quản lý các môn học của bạn
          </p>
        </div>
        <Button asChild>
          <Link href="/subjects/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm môn học
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách môn học</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có môn học nào. Hãy thêm môn học mới để bắt đầu!
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <h3 className="font-medium">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subject.credits} tín chỉ
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/subjects/edit/${subject.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(subject.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xoá</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá môn học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá môn học này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}