import { create } from 'zustand'

interface BekreftSlettModalStore {
  open: boolean
  annonseId: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

export const useBekreftSlettModal = create<BekreftSlettModalStore>((set) => ({
  open: false,
  annonseId: null,
  openModal: (id) => set({ open: true, annonseId: id }),
  closeModal: () => set({ open: false, annonseId: null }),
}))
