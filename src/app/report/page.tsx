"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

type Subject = {
  id: string
  code: string
  name: string
  credits: number
  tuition_credits: number
  color: string
}

export default function ReportPage() {
  const searchParams = useSearchParams()
  const subjectId = searchParams.get("subject_id")
  const week = parseInt(searchParams.get("week") || "25")
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [subject, setSubject] = useState<Subject | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [reportType, setReportType] = useState<"subject" | "week">(
    subjectId ? "subject" : "week"
  )
  const router = useRouter()

  useEffect(() => {
    if (subjectId) {
      fetchSubjectNotes()
    } else {
      fetchWeekNotes()
    }
      fetchAllSubjects()
  }, [subjectId, week])

  const fetchAllSubjects = async () => {
    const { data, error } = await supabase.from("subjects").select("id, code, name, credits, tuition_credits, color")
    if (!error) setSubjects(data || [])
  }

  const fetchSubjectNotes = async () => {
    setLoading(true)
    const { data: lessons, error: lessonError } = await supabase
      .from("lessons")
      .select("id")
      .eq("subject_id", subjectId)
    if (lessonError) {
      console.error("Error fetching lessons:", lessonError)
      toast.error("Không thể tải danh sách bài học")
      setLoading(false)
      return
    }

    const lessonIds = lessons.map((l) => l.id)
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .in("lesson_id", lessonIds)
    if (error) {
      console.error("Error fetching notes:", error)
      toast.error("Không thể tải ghi chú")
    } else {
      setNotes(data || [])
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single()
      setSubject(subjectData)
    }
    setLoading(false)
  }

  const fetchWeekNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("week_number", week)
    if (error) {
      console.error("Error fetching notes:", error)
      toast.error("Không thể tải ghi chú")
    } else {
      setNotes(data || [])
    }
    setLoading(false)
  }

  const startDate = new Date("2025-06-16") // Start of semester
  const weekOffset = (week - 25) * 7
  const reportDate = new Date(startDate)
  reportDate.setDate(startDate.getDate() + weekOffset)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {subjectId
            ? `Báo cáo môn học - ${subject?.name || "Tải dữ liệu..."}`
            : `Báo cáo tuần - Tuần ${week} (${reportDate.toLocaleDateString("vi-VN")})`}
        </h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← Quay lại
        </Button>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="space-y-6">
          {subjectId ? (
            // Báo cáo theo môn học
            <div>
              <h2 className="text-2xl font-semibold">Tổng hợp ghi chú</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Lý thuyết</h3>
                  {notes
                    .map((n) => n.theory)
                    .filter((t) => t)
                    .join("\n\n")}
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Bài tập</h3>
                  {notes
                    .map((n) => n.exercises)
                    .filter((e) => e)
                    .join("\n\n")}
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Công thức</h3>
                  {notes
                    .map((n) => n.formulas)
                    .filter((f) => f)
                    .join("\n\n")}
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Từ vựng tiếng Anh</h3>
                  {notes
                    .map((n) => n.vocabulary)
                    .filter((v) => v)
                    .join("\n\n")}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium">Hình ảnh</h3>
                <div className="flex gap-2 flex-wrap">
                  {notes
                    .flatMap((n) => n.images)
                    .filter((img) => img)
                    .map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Report image ${index}`}
                        className="w-20 h-20 object-cover"
                      />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            // Báo cáo theo tuần
            <div>
              <h2 className="text-2xl font-semibold">Tổng hợp ghi chú tuần</h2>
              {notes.length > 0 ? (
                <div>
                  {notes
                    .reduce((acc, curr) => {
                      const subj = acc.find((s) => s.subjectId === curr.lesson_id.split("-")[0])
                      if (subj) {
                        subj.notes.push(curr)
                      } else {
                        acc.push({ subjectId: curr.lesson_id.split("-")[0], notes: [curr] })
                      }
                      return acc
                    }, [] as { subjectId: string; notes: Note[] }[])
                    .map((group) => {
                      const subjInfo = subjects.find((s) => s.id === group.subjectId)
                      return (
                        <div key={group.subjectId} className="mb-6 p-4 border rounded">
                          <h3 className="font-semibold">{subjInfo?.name || "Môn học không xác định"}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="p-2 border rounded">
                              <h4 className="font-medium">Lý thuyết</h4>
                              {group.notes
                                .map((n) => n.theory)
                                .filter((t) => t)
                                .join("\n\n")}
                            </div>
                            <div className="p-2 border rounded">
                              <h4 className="font-medium">Bài tập</h4>
                              {group.notes
                                .map((n) => n.exercises)
                                .filter((e) => e)
                                .join("\n\n")}
                            </div>
                            <div className="p-2 border rounded">
                              <h4 className="font-medium">Công thức</h4>
                              {group.notes
                                .map((n) => n.formulas)
                                .filter((f) => f)
                                .join("\n\n")}
                            </div>
                            <div className="p-2 border rounded">
                              <h4 className="font-medium">Từ vựng tiếng Anh</h4>
                              {group.notes
                                .map((n) => n.vocabulary)
                                .filter((v) => v)
                                .join("\n\n")}
                            </div>
                          </div>
                          <div className="mt-2">
                            <h4 className="font-medium">Hình ảnh</h4>
                            <div className="flex gap-2 flex-wrap">
                              {group.notes
                                .flatMap((n) => n.images)
                                .filter((img) => img)
                                .map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Report image ${index}`}
                                    className="w-20 h-20 object-cover"
                                  />
                                ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p>Không có ghi chú nào cho tuần này</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}