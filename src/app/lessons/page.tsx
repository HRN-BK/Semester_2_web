"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Lesson = {
  id: string
  subject_id: string
  semester: string
  group_name: string
  day: number
  periods: string
  time: string
  room: string
  campus: string
  week_pattern: string
}

type Subject = {
  id: string
  code: string
  name: string
  credits: number
  tuition_credits: number
  color: string
}

type Note = {
  id: string
  lesson_id: string
  week_number: number
  theory: string
  exercises: string
  formulas: string
  vocabulary: string
  images: string[]
  created_at: string
}

export default function LessonNotesPage() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get("lesson_id")
  const week = parseInt(searchParams.get("week") || "25")
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    theory: "",
    exercises: "",
    formulas: "",
    vocabulary: "",
    images: [] as string[],
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
      fetchNote()
    }
  }, [lessonId, week])

  const fetchLesson = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single()
    if (error) {
      console.error("Error fetching lesson:", error)
      toast.error("Không thể tải thông tin bài học")
    } else {
      setLesson(data)
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", data.subject_id)
        .single()
      setSubject(subjectData)
    }
    setLoading(false)
  }

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("week_number", week)
      .single()
    if (error && error.code !== "PGRST116") { // PGRST116: No rows returned
      console.error("Error fetching note:", error)
      toast.error("Không tìm thấy ghi chú")
    } else if (data) {
      setNote(data)
      setFormData({
        theory: data.theory,
        exercises: data.exercises,
        formulas: data.formulas,
        vocabulary: data.vocabulary,
        images: data.images || [],
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...files])
    }
  }

  const saveNote = async () => {
    setIsSaving(true)
    try {
      let imageUrls: string[] = formData.images || []

      // Upload new images to Supabase Storage
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`
          const { error: uploadError, data } = await supabase.storage
            .from("lesson_images")
            .upload(`notes/${fileName}`, file, { upsert: true })
          if (uploadError) throw uploadError
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lesson_images/notes/${fileName}`
        })
        imageUrls = [...imageUrls, ...(await Promise.all(uploadPromises))]
      }

      if (note) {
        // Update existing note
        const { error } = await supabase
          .from("notes")
          .update({
            theory: formData.theory,
            exercises: formData.exercises,
            formulas: formData.formulas,
            vocabulary: formData.vocabulary,
            images: imageUrls,
          })
          .eq("id", note.id)
        if (error) throw error
        toast.success("Cập nhật ghi chú thành công!")
      } else {
        // Create new note
        const { error } = await supabase
          .from("notes")
          .insert({
            lesson_id: lessonId!,
            week_number: week,
            theory: formData.theory,
            exercises: formData.exercises,
            formulas: formData.formulas,
            vocabulary: formData.vocabulary,
            images: imageUrls,
          })
        if (error) throw error
        toast.success("Lưu ghi chú thành công!")
      }

      setImageFiles([])
      fetchNote() // Refresh note data
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error("Có lỗi xảy ra khi lưu ghi chú")
    } finally {
      setIsSaving(false)
    }
  }

  const dayName = lesson?.day === 2 ? "Thứ 2" : lesson?.day === 3 ? "Thứ 3" : lesson?.day === 4 ? "Thứ 4" : lesson?.day === 5 ? "Thứ 5" : lesson?.day === 6 ? "Thứ 6" : lesson?.day === 7 ? "Thứ 7" : "Chủ nhật"
  const startDate = new Date("2025-06-16") // Start of semester
  const weekOffset = (week - 25) * 7
  const dayOffset = ((Number(lesson?.day ?? 2)) - startDate.getDay() + 7) % 7
  const eventDate = new Date(startDate)
  eventDate.setDate(startDate.getDate() + weekOffset + dayOffset)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Ghi chú - {subject?.name || "Tải dữ liệu..."} (Tuần {week}, {eventDate.toLocaleDateString("vi-VN")})
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            ← Quay lại
          </Button>
        </div>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : lesson && subject ? (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Thông tin bài học</h3>
            <p><strong>Thời gian:</strong> {lesson.time}</p>
            <p><strong>Phòng:</strong> {lesson.room}</p>
            <p><strong>Cơ sở:</strong> {lesson.campus}</p>
            <p><strong>Nhóm:</strong> {lesson.group_name}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Lý thuyết</label>
              <Textarea
                value={formData.theory}
                onChange={(e) => setFormData({ ...formData, theory: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bài tập</label>
              <Textarea
                value={formData.exercises}
                onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Công thức</label>
              <Textarea
                value={formData.formulas}
                onChange={(e) => setFormData({ ...formData, formulas: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Từ vựng tiếng Anh</label>
              <Textarea
                value={formData.vocabulary}
                onChange={(e) => setFormData({ ...formData, vocabulary: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hình ảnh</label>
              <Input type="file" multiple onChange={handleImageUpload} className="w-full p-2 border rounded" />
              <div className="flex gap-2 mt-2">
                {formData.images.map((url, index) => (
                  <img key={index} src={url} alt={`Note image ${index}`} className="w-20 h-20 object-cover" />
                ))}
              </div>
            </div>
            <Button onClick={saveNote} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : "Lưu ghi chú"}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/report?subject_id=${subject.id}`)}>
              Xem báo cáo môn học
            </Button>
            <Button variant="outline" onClick={() => router.push(`/report?week=${week}`)}>
              Xem báo cáo tuần
            </Button>
          </div>
        </div>
      ) : (
        <p>Không tìm thấy bài học</p>
      )}
    </div>
  )
}