'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function createStudent(formData: any) {
  try {
    const supabase = createAdminClient()

    const {
      full_name,
      reg_number,
      password,
      class: className,
      gender,
      date_of_birth,
      session,
      guardian_name,
      guardian_phone,
      address
    } = formData

    // 1. Derive internal email
    const email = `${reg_number.trim().toLowerCase().replace(/\//g, '_')}@gssjiwa.student`

    // 2. Create Auth User using Admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, reg_number }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return { error: authError.message }
    }

    const userId = authData.user.id

    // 3. Create Profile (The trigger handle_new_user might already do this, 
    // but we upsert to include all details)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: 'student',
        full_name,
        reg_number: reg_number.toUpperCase(),
        class: className,
        gender,
        date_of_birth: date_of_birth || null,
        session: session || '2024/2025',
        guardian_name,
        guardian_phone,
        address,
        status: 'Active'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Attempt to cleanup auth user if profile fails? 
      // In this case, we'll just return the error.
      return { error: profileError.message }
    }

    revalidatePath('/admin/dashboard/students')
    return { success: true, userId }

  } catch (err: any) {
    console.error('Unexpected error:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}
