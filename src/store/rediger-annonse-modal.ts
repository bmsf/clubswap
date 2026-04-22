import { create } from 'zustand'

interface RedigerAnnonseModalStore {
  open: boolean
  annonseId: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

export const useRedigerAnnonseModal = create<RedigerAnnonseModalStore>((set) => ({
  open: false,
  annonseId: null,
  openModal: (id) => set({ open: true, annonseId: id }),
  closeModal: () => set({ open: false, annonseId: null }),
}))
