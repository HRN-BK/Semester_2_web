"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, ChevronLeft, ChevronRight, Loader2, Plus, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Schedule, Subject } from "@/lib/supabase/schema"

interface Tag {
  id: string
  name: string
  color: string
  type: string
  is_active: boolean
}

export default function CalendarPage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedWeek, setSelectedWeek] = useState(25)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch data when selectedWeek or selectedTags changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (tagsError) throw tagsError
        setTags(tagsData || [])

        // If no tags are selected, select all by default
        if (selectedTags.length === 0 && tagsData?.length > 0) {
          setSelectedTags(tagsData.map(tag => tag.id))
        }

        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')


        if (subjectsError) throw subjectsError

        // Build query for schedules
        let query = supabase
          .from('schedules')
          .select('*')
          .gte('week_start', selectedWeek)
          .lte('week_end', selectedWeek)
          .order('day', { ascending: true })
          .order('start_time', { ascending: true })

        // Filter by selected tags if any
        if (selectedTags.length > 0) {
          query = query.in('tag_id', selectedTags)
        }

        const { data: schedulesData, error: schedulesError } = await query

        if (schedulesError) throw schedulesError

        // Convert schedule times to 50-minute blocks starting from 6:00 AM
        const formattedSchedules = schedulesData?.map(schedule => {
          // Get the base date (using the schedule's date but with fixed times)
          const baseDate = new Date(schedule.start_time.split('T')[0])
          
          // Calculate hours and minutes based on period number (1-12)
          const periodNumber = schedule.period || 1
          const startHour = 6 + Math.floor((periodNumber - 1) * 50 / 60)
          const startMinute = ((periodNumber - 1) * 50) % 60
          
          // Set start time (6:00, 6:50, 7:40, etc.)
          const startTime = new Date(baseDate)
          startTime.setHours(startHour, startMinute, 0, 0)
          
          // End time is 50 minutes later
          const endTime = new Date(startTime.getTime() + 50 * 60 * 1000)
          
          return {
            ...schedule,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
          }
        }) || []

        setSubjects(subjectsData || [])
        setSchedules(formattedSchedules)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedWeek, JSON.stringify(selectedTags)]) // Use JSON.stringify to prevent unnecessary re-renders

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Bạn có chắc muốn xóa lịch học này?')) return
    
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      // Update local state
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId))
    } catch (err) {
      console.error('Error deleting schedule:', err)
      alert('Không thể xóa lịch học. Vui lòng thử lại sau.')
    }
  }

  const startDate = new Date("2025-06-16") // Bắt đầu học kỳ từ 16/6/2025 (tuần 25)
  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + (selectedWeek - 25) * 7 + i)
    return date
  })

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 max-w-md">
            <p className="text-red-200">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Handle navigation to add new schedule
  const handleAddNew = () => {
    router.push('/calendar/new')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-100">Lịch học - Tuần {selectedWeek}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSelectedWeek(Math.max(25, selectedWeek - 1))}
                disabled={selectedWeek <= 25}
                className="p-2 text-gray-100 hover:bg-gray-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-gray-300 px-2 text-sm font-medium">Tuần {selectedWeek}</span>
              <button
                onClick={() => setSelectedWeek(Math.min(33, selectedWeek + 1))}
                disabled={selectedWeek >= 33}
                className="p-2 text-gray-100 hover:bg-gray-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm lịch mới</span>
            </button>
          </div>
        </div>

        {/* Tags Filter */}
        {showFilters && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Bộ lọc theo nhãn</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTags(tags.map(tag => tag.id))}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {daysInWeek.map((date, index) => {
            const daySchedules = schedules.filter((schedule) => {
              const scheduleDate = new Date(schedule.start_time)
              return scheduleDate.getDay() === (date.getDay() + 6) % 7 + 1 // Adjust for week start on Monday
            })

            return (
              <div key={index} className="space-y-3">
                <h2 className="text-xl font-medium text-gray-200">
                  {dayNames[index]}
                </h2>
                <div className="text-sm text-gray-400 mb-4">
                  {date.toLocaleDateString("vi-VN", { 
                    day: "2-digit", 
                    month: "2-digit",
                    year: "numeric"
                  })}
                </div>
                
                {daySchedules.length > 0 ? (
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => {
                      const subject = subjects.find((s) => s.id === schedule.subject_id)
                      const tag = tags.find(t => t.id === schedule.tag_id)
                      return (
                        <div
                          key={schedule.id}
                          className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-medium text-gray-100">
                                  {subject?.name || schedule.title}
                                </h3>
                                {tag && (
                                  <span 
                                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                    style={{ backgroundColor: tag.color }}
                                  >
                                    {tag.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                {new Date(schedule.start_time).toLocaleTimeString("vi-VN", { 
                                  hour: "2-digit", 
                                  minute: "2-digit" 
                                })} - {new Date(schedule.end_time).toLocaleTimeString("vi-VN", { 
                                  hour: "2-digit", 
                                  minute: "2-digit" 
                                })}
                              </p>
                              <p className="text-sm text-gray-500">
                                Phòng: {schedule.room}, {schedule.campus}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-700 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-500 text-center">Không có lịch học</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}