/**
 * Supabase Database Schema Definitions
 * 
 * This file contains TypeScript types that mirror your Supabase database tables.
 * Keep this in sync with your actual database schema.
 */

/**
 * Subjects table
 * Stores information about academic subjects/courses
 */
export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  tuition_credits: number
  color?: string
  created_at: string
  updated_at: string
}

/**
 * Schedules table
 * Stores class schedules with time slots and locations
 */
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
  semester: string  // e.g., "20243" for 2024-2025 semester 3
  tag_id?: string  // Optional foreign key to tags table
  color?: string
  created_at: string
  updated_at: string
}

/**
 * Notes table
 * Stores study notes related to specific lessons
 */
export interface Note {
  id: string
  lesson_id: string
  week_number: number
  theory: string | null
  exercises: string | null
  formulas: string | null
  vocabulary: string | null
  images: string[]  // Array of image URLs
  created_at: string
  updated_at: string
}

/**
 * Lessons table
 * Represents individual lessons or class sessions
 */
export interface Lesson {
  id: string
  subject_id: string
  title: string
  day: number  // 2-8 (2=Monday, 8=Sunday)
  start_time: string
  end_time: string
  room: string
  campus: string
  created_at: string
  updated_at: string
}

/**
 * Tasks table
 * Tracks assignments and homework
 */
export interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  subject_id: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

/**
 * Table name to type mapping
 */
export interface DatabaseTables {
  subjects: Subject
  schedules: Schedule
  notes: Note
  lessons: Lesson
  tasks: Task
}

/**
 * Table names as a type
 */
export type TableName = keyof DatabaseTables
