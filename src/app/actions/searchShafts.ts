'use server'

import { createClient } from '@/supabase/server'

export interface ShaftResultat {
  id: string
  brand: string
  model: string
  category: string
}

export async function searchShafts(query: string, category?: string): Promise<ShaftResultat[]> {
  if (query.trim().length < 2) return []
  const supabase = await createClient()

  let q = supabase
    .from('golf_shafts')
    .select('id, brand, model, category')
    .ilike('search_text', `%${query}%`)
    .order('brand', { ascending: true })
    .order('model', { ascending: true })
    .limit(20)

  if (category) q = q.eq('category', category)

  const { data } = await q
  return (data ?? []) as ShaftResultat[]
}
