'use server'

import { createClient } from '@/supabase/server'

export interface ShaftResult {
  id: string
  brand: string
  model: string
  category: string
}

export async function searchShafts(query: string, category: string): Promise<ShaftResult[]> {
  if (query.length < 2) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('golf_shafts')
    .select('id, brand, model, category')
    .eq('category', category)
    .ilike('search_text', `%${query}%`)
    .limit(8)
  return (data ?? []) as ShaftResult[]
}
