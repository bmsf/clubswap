'use server'

import { createClient } from '@/supabase/server'

export interface ModellVariant {
  category: string
  equipmentId: string
  count: number
}

export interface ModellGruppe {
  brand: string
  model: string
  year: number | null
  variants: ModellVariant[]
}

export async function searchModeller(query: string): Promise<ModellGruppe[]> {
  if (query.trim().length < 2) return []
  const supabase = await createClient()

  const [{ data: utstyr }, { data: annonser }] = await Promise.all([
    supabase
      .from('golf_equipment')
      .select('id, brand, model, year, category')
      .ilike('search_text', `%${query}%`)
      .limit(20),
    supabase.from('annonser').select('merke, kategori').ilike('modell', `%${query}%`),
  ])

  if (!utstyr?.length) return []

  // Count annonser by (merke, kategori)
  const countMap = new Map<string, number>()
  for (const a of annonser ?? []) {
    const key = `${a.merke}__${a.kategori}`
    countMap.set(key, (countMap.get(key) ?? 0) + 1)
  }

  // Group equipment by brand+model, keep latest year
  const grupper = new Map<string, ModellGruppe>()
  for (const r of utstyr) {
    const key = `${r.brand}__${r.model}`
    if (!grupper.has(key)) {
      grupper.set(key, {
        brand: r.brand,
        model: r.model,
        year: r.year as number | null,
        variants: [],
      })
    } else {
      const g = grupper.get(key)!
      if (r.year && (!g.year || (r.year as number) > g.year)) g.year = r.year as number
    }
    const gruppe = grupper.get(key)!
    const count = countMap.get(`${r.brand}__${r.category}`) ?? 0
    gruppe.variants.push({ category: r.category as string, equipmentId: r.id as string, count })
  }

  return [...grupper.values()]
}
