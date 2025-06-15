"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { Loader2, Plus, Edit2, Trash2, Save, X } from "lucide-react"

// Định nghĩa kiểu dữ liệu
type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  tuition_credits?: number;
  color: string;
}

type Tag = {
  id: string;
  name: string;
  type: string;
  color: string;
  created_at: string;
}

type FormData = {
  subject_id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  campus: string;
  weeks: boolean[];
  tag_id: string;
}

export default function NewCalendarPage() {
  const [rawData, setRawData] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("paste")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [dataType, setDataType] = useState<"schedule" | "exam">("schedule")
  
  // State cho manual setup
  const [formData, setFormData] = useState<FormData>({
    subject_id: "",
    day: "",
    startTime: "",
    endTime: "",
    room: "",
    campus: "BK-LTK",
    weeks: Array(9).fill(false).map((_, i) => i + 25 < 34),
    tag_id: ""
  })

  // State cho tag management
  const [newTagName, setNewTagName] = useState<string>("")
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [showAddTag, setShowAddTag] = useState<boolean>(false)

  useEffect(() => {
    fetchSubjects()
    fetchTags()
  }, [])

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from("subjects").select("*")
    if (error) {
      console.error("Error fetching subjects:", error)
      toast.error("Không thể tải danh sách môn học")
    } else {
      setSubjects(data || [])
    }
  }

  const fetchTags = async () => {
    const { data, error } = await supabase.from("tags").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching tags:", error)
      toast.error("Không thể tải danh sách tags")
    } else {
      setTags(data || [])
    }
  }

  const createTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Vui lòng nhập tên tag")
      return
    }

    const { data, error } = await supabase.from("tags").insert({
      name: newTagName,
      type: "manual",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }).select().single()

    if (error) {
      toast.error("Không thể tạo tag mới")
    } else {
      setTags([data, ...tags])
      setNewTagName("")
      setShowAddTag(false)
      toast.success("Đã tạo tag mới")
    }
  }

  const updateTag = async (tagId: string, newName: string) => {
    const { error } = await supabase.from("tags").update({ name: newName }).eq("id", tagId)
    if (error) {
      toast.error("Không thể cập nhật tag")
    } else {
      setTags(tags.map(tag => tag.id === tagId ? { ...tag, name: newName } : tag))
      setEditingTag(null)
      toast.success("Đã cập nhật tag")
    }
  }

  const deleteTag = async (tagId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tag này? Tất cả dữ liệu liên quan sẽ bị xóa.")) return

    const { error } = await supabase.from("tags").delete().eq("id", tagId)
    if (error) {
      toast.error("Không thể xóa tag")
    } else {
      setTags(tags.filter(tag => tag.id !== tagId))
      toast.success("Đã xóa tag")
    }
  }

  const clearTagData = async (tagId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu của tag này?")) return

    try {
      await supabase.from("schedules").delete().eq("tag_id", tagId)
      await supabase.from("exams").delete().eq("tag_id", tagId)
      toast.success("Đã xóa toàn bộ dữ liệu của tag")
    } catch (error) {
      toast.error("Không thể xóa dữ liệu")
    }
  }

  const parseScheduleData = (data: string): any[] => {
    const lines = data.trim().split(/\n|\r\n/).filter(line => line.trim())
    const results = []
    
    for (const line of lines) {
      try {
        const match = line.match(/(\*\*\d{5})\*\*([A-Z0-9]+)([^0-9]+)(\d+)(\d+)([^2-7CN]+)([2-7CN]+)([^0-9:]+)([\d:]+\s*-\s*[\d:]+)([^B-Z]*)(BK[^|]*)\|(.+)/);
        if (!match) continue

        const [, semester, subjectCode, subjectName, credits, tuitionCredits, group, day, , time, room, campus, weekPattern] = match
        const weeks = weekPattern
          .split('|')
          .map((w, index) => (w.trim() && w !== '--' ? index + 25 : null))
          .filter((w) => w !== null)
        if (weeks.length === 0 || !day || !time) continue

        const timeMatch = time.match(/([\d:]+)\s*-\s*([\d:]+)/)
        if (!timeMatch) continue
        const [, startTime, endTime] = timeMatch

        results.push({
          semester: semester.replace(/\*\*/g, ''),
          subjectCode: subjectCode.trim(),
          subjectName: subjectName.trim(),
          credits: parseInt(credits) || 0,
          tuitionCredits: parseInt(tuitionCredits) || 0,
          group: group.trim(),
          day: day.trim(),
          time: `${startTime} - ${endTime}`,
          room: room.trim(),
          campus: campus.trim(),
          weeks
        })
      } catch (error) {
        console.warn(`Bỏ qua dòng không hợp lệ: ${line}`)
      }
    }
    return results
  }

  const parseExamData = (data: string): any[] => {
    const lines = data.trim().split(/\n|\r\n/).filter(line => line.trim())
    const results = []
    
    for (const line of lines) {
      try {
        const fields = line.split(/\s+/)
        if (fields.length < 10) continue

        const semester = fields[0]
        const subjectInfo = fields[1]
        const groupClass = fields[2]
        const examDate = fields[3]
        const examType = fields[4]
        const campus = fields[5]
        const room = fields[6]
        const dayOfWeek = fields[7]
        const startTime = fields[8]
        const duration = fields[9]

        const subjectMatch = subjectInfo.match(/([A-Z0-9]+)\s*-\s*(.+)/)
        if (!subjectMatch) continue
        const [, subjectCode, subjectName] = subjectMatch

        results.push({
          semester,
          subjectCode: subjectCode.trim(),
          subjectName: subjectName.trim(),
          groupClass,
          examDate,
          examType,
          campus,
          room,
          dayOfWeek: parseInt(dayOfWeek) || 0,
          startTime,
          durationMinutes: parseInt(duration) || 0
        })
      } catch (error) {
        console.warn(`Bỏ qua dòng không hợp lệ: ${line}`)
      }
    }
    return results
  }

  const handlePasteSubmit = async () => {
    if (!rawData.trim()) {
      toast.error("Vui lòng dán dữ liệu")
      return
    }
    if (!selectedTag) {
      toast.error("Vui lòng chọn tag")
      return
    }

    setIsSubmitting(true)
    try {
      if (dataType === "schedule") {
        await supabase.from("schedules").delete().eq("tag_id", selectedTag)
      } else {
        await supabase.from("exams").delete().eq("tag_id", selectedTag)
      }

      if (dataType === "schedule") {
        const scheduleData = parseScheduleData(rawData)
        for (const item of scheduleData) {
          let subjectId = ""
          const { data: existingSubject } = await supabase
            .from("subjects")
            .select("id")
            .eq("code", item.subjectCode)
            .single()

          if (existingSubject) {
            subjectId = existingSubject.id
          } else {
            const { data: newSubject } = await supabase
              .from("subjects")
              .insert({
                code: item.subjectCode,
                name: item.subjectName,
                credits: item.credits,
                tuition_credits: item.tuitionCredits,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
              })
              .select("id")
              .single()
            if (newSubject) subjectId = newSubject.id
          }

          const startDate = new Date("2025-06-16")
          const dayMapping = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "CN": 8 }
          const dayOfWeek = dayMapping[item.day as keyof typeof dayMapping] || 2

          for (const week of item.weeks) {
            const weekOffset = (week - 25) * 7
            const dayOffset = (dayOfWeek - startDate.getDay() + 7) % 7
            const eventDate = new Date(startDate)
            eventDate.setDate(startDate.getDate() + weekOffset + dayOffset)

            const [startHour, startMinute] = item.time.split(" - ")[0].split(":").map(Number)
            const [endHour, endMinute] = item.time.split(" - ")[1].split(":").map(Number)

            const startTime = new Date(eventDate)
            startTime.setHours(startHour, startMinute, 0, 0)

            const endTime = new Date(eventDate)
            endTime.setHours(endHour, endMinute, 0, 0)

            await supabase.from("schedules").insert({
              subject_id: subjectId,
              title: item.subjectName,
              day: dayOfWeek,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              room: item.room,
              campus: item.campus,
              semester: item.semester,
              week_start: week,
              week_end: week,
              tag_id: selectedTag,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
            })
          }
        }
      } else {
        const examData = parseExamData(rawData)
        for (const item of examData) {
          let subjectId = ""
          const { data: existingSubject } = await supabase
            .from("subjects")
            .select("id")
            .eq("code", item.subjectCode)
            .single()

          if (existingSubject) {
            subjectId = existingSubject.id
          } else {
            const { data: newSubject } = await supabase
              .from("subjects")
              .insert({
                code: item.subjectCode,
                name: item.subjectName,
                credits: 0,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
              })
              .select("id")
              .single()
            if (newSubject) subjectId = newSubject.id
          }

          await supabase.from("exams").insert({
            subject_id: subjectId,
            subject_code: item.subjectCode,
            subject_name: item.subjectName,
            group_class: item.groupClass,
            exam_date: item.examDate,
            exam_type: item.examType,
            campus: item.campus,
            room: item.room,
            day_of_week: item.dayOfWeek,
            start_time: item.startTime,
            duration_minutes: item.durationMinutes,
            semester: item.semester,
            tag_id: selectedTag
          })
        }
      }

      toast.success(`Đã thêm ${dataType === "schedule" ? "thời khóa biểu" : "lịch thi"} thành công!`)
      setRawData("")
    } catch (error: unknown) {
      console.error("Error processing data:", error)
      toast.error(`Có lỗi xảy ra: ${(error as Error).message || "Không xác định"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.subject_id || !formData.day || !formData.startTime || !formData.endTime || !formData.tag_id) {
        toast.error("Vui lòng điền đầy đủ thông tin")
        return
      }

      const subject = subjects.find(s => s.id === formData.subject_id)
      if (!subject) {
        toast.error("Môn học không hợp lệ")
        return
      }

      const startDate = new Date("2025-06-16")
      const dayMapping = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "CN": 8 }
      const dayOfWeek = dayMapping[formData.day as keyof typeof dayMapping] || 2

      for (let i = 0; i < formData.weeks.length; i++) {
        if (!formData.weeks[i]) continue

        const week = i + 25
        const weekOffset = (week - 25) * 7
        const dayOffset = (dayOfWeek - startDate.getDay() + 7) % 7
        const eventDate = new Date(startDate)
        eventDate.setDate(startDate.getDate() + weekOffset + dayOffset)

        const [startHour, startMinute] = formData.startTime.split(":").map(Number)
        const [endHour, endMinute] = formData.endTime.split(":").map(Number)

        const startTime = new Date(eventDate)
        startTime.setHours(startHour, startMinute, 0, 0)

        const endTime = new Date(eventDate)
        endTime.setHours(endHour, endMinute, 0, 0)

        await supabase.from("schedules").insert({
          subject_id: formData.subject_id,
          title: subject.name,
          day: dayOfWeek,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          room: formData.room,
          campus: formData.campus,
          semester: "manual",
          week_start: week,
          week_end: week,
          tag_id: formData.tag_id,
          color: subject.color || "#3b82f6"
        })
      }

      toast.success("Đã thêm lịch học thành công!")
      setFormData({
        subject_id: "",
        day: "",
        startTime: "",
        endTime: "",
        room: "",
        campus: "BK-LTK",
        weeks: Array(9).fill(false),
        tag_id: ""
      })
    } catch (error: unknown) {
      console.error("Error adding manual schedule:", error)
      toast.error(`Có lỗi xảy ra: ${(error as Error).message || "Không xác định"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý lịch học và lịch thi</h1>

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quản lý Tags</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2">
              {editingTag === tag.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={tag.name}
                    onChange={(e) => setTags(tags.map(t => t.id === tag.id ? {...t, name: e.target.value} : t))}
                    className="w-32 h-8"
                  />
                  <Button size="sm" onClick={() => updateTag(tag.id, tag.name)}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingTag(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  style={{ backgroundColor: tag.color + "20", borderColor: tag.color }}
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <span>{tag.name}</span>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setEditingTag(tag.id)}
                      className="text-xs hover:text-blue-600"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => clearTagData(tag.id)}
                      className="text-xs hover:text-yellow-600"
                      title="Xóa dữ liệu"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="text-xs hover:text-red-600"
                      title="Xóa tag"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </Badge>
              )}
            </div>
          ))}
          
          {showAddTag ? (
            <div className="flex items-center gap-1">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tên tag mới"
                className="w-32 h-8"
              />
              <Button size="sm" onClick={createTag}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddTag(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setShowAddTag(true)} variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Thêm tag
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Dán dữ liệu</TabsTrigger>
          <TabsTrigger value="manual">Cài đặt thủ công</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại dữ liệu</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schedule">Thời khóa biểu</SelectItem>
                    <SelectItem value="exam">Lịch thi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tag</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              placeholder={
                dataType === "schedule" 
                  ? "Dán thời khóa biểu từ mybk.hcmut.edu.vn/app tại đây..."
                  : "Dán lịch thi từ mybk.hcmut.edu.vn/app tại đây..."
              }
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              rows={12}
              className="w-full font-mono text-sm"
            />
            
            <Button 
              onClick={handlePasteSubmit} 
              disabled={isSubmitting || !rawData.trim() || !selectedTag} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : `Lưu ${dataType === "schedule" ? "thời khóa biểu" : "lịch thi"}`}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {`${subject.code} - ${subject.name} (${subject.credits} tín chỉ)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tag</Label>
                <Select
                  value={formData.tag_id}
                  onValueChange={(v) => setFormData({ ...formData, tag_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ngày trong tuần</Label>
                <Select
                  value={formData.day}
                  onValueChange={(v) => setFormData({ ...formData, day: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngày" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Thứ 2</SelectItem>
                    <SelectItem value="3">Thứ 3</SelectItem>
                    <SelectItem value="4">Thứ 4</SelectItem>
                    <SelectItem value="5">Thứ 5</SelectItem>
                    <SelectItem value="6">Thứ 6</SelectItem>
                    <SelectItem value="7">Thứ 7</SelectItem>
                    <SelectItem value="CN">Chủ nhật</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thời gian bắt đầu</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Thời gian kết thúc</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Phòng học</Label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="VD: H1-101"
                />
              </div>

              <div className="space-y-2">
                <Label>Cơ sở</Label>
                <Select
                  value={formData.campus}
                  onValueChange={(v) => setFormData({ ...formData, campus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BK-LTK">BK-LTK</SelectItem>
                    <SelectItem value="BK-DH">BK-ĐH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tuần học</Label>
              <div className="grid grid-cols-9 gap-2">
                {formData.weeks.map((checked, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const newWeeks = [...formData.weeks]
                        newWeeks[index] = e.target.checked
                        setFormData({ ...formData, weeks: newWeeks })
                      }}
                    />
                    <span>{25 + index}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : "Lưu lịch học"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}