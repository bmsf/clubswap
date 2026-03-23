import { createClient } from '@/lib/supabase/server'
import type { Profile, ProfileUpdate } from '@/types'

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data
}

export async function updateProfile(id: string, update: ProfileUpdate): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('profiles').update(update).eq('id', id)

  if (error) throw new Error(`Failed to update profile: ${error.message}`)
}
