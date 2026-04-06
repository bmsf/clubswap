import { create } from 'zustand'

interface AuthModalStore {
  open: boolean
  fane: 'logg-inn' | 'registrer'
  redirectAfter: string | null
  openModal: (fane?: 'logg-inn' | 'registrer', redirectAfter?: string | null) => void
  closeModal: () => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  open: false,
  fane: 'logg-inn',
  redirectAfter: null,
  openModal: (fane = 'logg-inn', redirectAfter = null) => set({ open: true, fane, redirectAfter }),
  closeModal: () => set({ open: false }),
}))
