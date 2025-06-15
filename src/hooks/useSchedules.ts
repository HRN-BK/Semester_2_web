import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface Schedule {
  id: string
  subject_id: string
  title: string
  start_time: string
  end_time: string
  room: string
  campus: string
  week_start: number
  week_end: number
  color?: string
}

interface UseSchedulesResult {
  schedules: Schedule[]
  loading: boolean
  error: string | null
}

/**
 * React hook: fetch schedules for a given week from Supabase.
 *
 * @param week Academic week number (e.g. 25-33)
 */
export function useSchedules(week: number): UseSchedulesResult {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from<Schedule>("schedules")
        .select("*")
        .gte("week_start", week)
        .lte("week_end", week)
      if (!mounted) return
      if (error) {
        console.error("useSchedules error:", error)
        setError(error.message)
      } else {
        setSchedules(data || [])
        setError(null)
      }
      setLoading(false)
    }
    fetch()
    return () => {
      mounted = false
    }
  }, [week])

  return { schedules, loading, error }
}
