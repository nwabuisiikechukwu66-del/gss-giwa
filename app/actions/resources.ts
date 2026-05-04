'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function addResource(formData: {
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category: string;
  className?: string;
  userId: string;
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('resources').insert({
      title: formData.title,
      description: formData.description,
      file_url: formData.file_url,
      file_type: formData.file_type,
      category: formData.category,
      class: formData.className,
      uploaded_by: formData.userId
    })

    if (error) throw error

    revalidatePath('/admin/dashboard/resources')
    revalidatePath('/student/resources')
    return { success: true }
  } catch (err: any) {
    console.error('Error adding resource:', err)
    return { error: err.message }
  }
}

export async function deleteResource(id: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/dashboard/resources')
    revalidatePath('/student/resources')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting resource:', err)
    return { error: err.message }
  }
}
