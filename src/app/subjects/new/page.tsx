"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewSubjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('subjects')
      .insert({ name, credits: parseInt(credits) })
    if (error) {
      console.error('Error adding subject:', error)
    } else {
      router.push('/subjects')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Thêm môn học mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tên môn học</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Số tín chỉ</label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>
        <Button type="submit">Thêm môn học</Button>
      </form>
    </div>
  )
}