import { Suspense } from 'react'
import { LoggInnForm } from './logg-inn-form'

export const metadata = { title: 'Logg inn — ClubSwap' }

export default function LoggInnSide() {
  return (
    <Suspense>
      <LoggInnForm />
    </Suspense>
  )
}
