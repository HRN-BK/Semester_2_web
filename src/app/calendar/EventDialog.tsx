"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type Subject = {
  id: string
  name: string
  color: string
}

type FormData = {
  id?: string
  title: string
  subject_id: string
  start: string
  end: string
  room: string
  notes: string
  week_start: number
  week_end: number
}

type EventDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: FormData
  onFormChange: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  onDelete: (id: string) => void
  subjects: Subject[]
  isSubmitting: boolean
  isEditing: boolean
}

export function EventDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  onDelete,
  subjects,
  isSubmitting,
  isEditing,
}: EventDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleChange = (field: keyof FormData, value: any) => {
    onFormChange({ ...formData, [field]: value })
  }

  const handleDeleteClick = () => {
    if (formData.id) {
      onDelete(formData.id)
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Môn học</label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => handleChange('subject_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bắt đầu</label>
                <Input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => handleChange('start', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kết thúc</label>
                <Input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => handleChange('end', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tuần bắt đầu</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.week_start}
                  onChange={(e) => handleChange('week_start', parseInt(e.target.value) || 1)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tuần kết thúc</label>
                <Input
                  type="number"
                  min={formData.week_start}
                  value={formData.week_end}
                  onChange={(e) => handleChange('week_end', parseInt(e.target.value) || 1)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phòng học</label>
              <Input
                placeholder="Ví dụ: D9-401"
                value={formData.room}
                onChange={(e) => handleChange('room', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea
                placeholder="Thông tin bổ sung..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-2">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isSubmitting}
                  >
                    Xoá
                  </Button>
                )}
              </div>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Huỷ
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Cập nhật' : 'Thêm'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá lịch học này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
