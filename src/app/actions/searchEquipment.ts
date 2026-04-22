'use server'

import { createClient } from '@/supabase/server'

export interface EquipmentResult {
  id: string
  brand: string
  model: string
  year: number | null
  category: string
}

export async function searchEquipment(query: string, category: string): Promise<EquipmentResult[]> {
  if (query.length < 2) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('golf_equipment')
    .select('id, brand, model, year, category')
    .eq('category', category)
    .ilike('search_text', `%${query}%`)
    .limit(8)
  return (data ?? []) as EquipmentResult[]
}
