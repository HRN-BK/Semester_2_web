"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type Subject = {
  id: string
  name: string
}

export default function NewSessionPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase.from('subjects').select('id, name')
      if (error) {
        console.error('Error fetching subjects:', error)
      } else {
        setSubjects(data || [])
      }
    }
    fetchSubjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('sessions')
      .insert({ subject_id: subjectId, duration, date, notes })
    if (error) {
      console.error('Error adding session:', error)
    } else {
      router.push('/sessions')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Thêm phiên học mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Môn học</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          >
            <option value="">Chọn môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Thời lượng (ví dụ: 2h 15m)</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ngày (ví dụ: Hôm nay, 10:30 AM)</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ghi chú</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <Button type="submit">Thêm phiên học</Button>
      </form>
    </div>
  )
}