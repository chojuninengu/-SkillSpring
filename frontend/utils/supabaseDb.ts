import { supabase } from '../lib/supabaseClient'

export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getCourseById = async (id: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const enrollInCourse = async (courseId: string, userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([
      { course_id: courseId, user_id: userId }
    ])
    .select()
  
  if (error) throw error
  return data[0]
}

export const getEnrollments = async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export const updateCourseProgress = async (enrollmentId: string, progress: number) => {
  const { data, error } = await supabase
    .from('enrollments')
    .update({ progress })
    .eq('id', enrollmentId)
    .select()
  
  if (error) throw error
  return data[0]
} 