'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TILLATTE_BILDE_TYPER, MAKS_BILDESTORRELSE_BYTES, MAKS_ANTALL_BILDER } from './constants'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BildeEntry = { file: File; url: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validerFiler(files: File[]): string | null {
  if (files.some((f) => !TILLATTE_BILDE_TYPER.includes(f.type)))
    return 'Kun JPG, PNG og WEBP er tillatt.'
  if (files.some((f) => f.size > MAKS_BILDESTORRELSE_BYTES))
    return 'Hvert bilde må være under 5 MB.'
  return null
}

// ── BildeThumbnail ────────────────────────────────────────────────────────────

function BildeThumbnail({
  src,
  erForside,
  onFjern,
}: {
  src: string
  erForside: boolean
  onFjern: () => void
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onFjern}
        className="absolute top-1.5 right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {erForside && (
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          Forside
        </span>
      )}
    </div>
  )
}

// ── BildeOpplaster ────────────────────────────────────────────────────────────

export function BildeOpplaster({
  bilder,
  eksisterendeBilder,
  onLeggTil,
  onFjern,
  onFjernEksisterende,
}: {
  bilder: BildeEntry[]
  eksisterendeBilder: string[]
  onLeggTil: (files: FileList | null) => void
  onFjern: (i: number) => void
  onFjernEksisterende: (i: number) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const total = eksisterendeBilder.length + bilder.length

  return (
    <div>
      {total < MAKS_ANTALL_BILDER && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            onLeggTil(e.dataTransfer.files)
          }}
          className={cn(
            'border-border mb-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50 cursor-pointer'
          )}
          onClick={() => fileRef.current?.click()}
        >
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <Upload className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">
              Dra og slipp eller klikk for å laste opp
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              JPG, PNG, WEBP · Maks {MAKS_ANTALL_BILDER} bilder
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={TILLATTE_BILDE_TYPER.join(',')}
            multiple
            className="hidden"
            onChange={(e) => onLeggTil(e.target.files)}
          />
        </div>
      )}

      {total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {eksisterendeBilder.map((url, i) => (
            <BildeThumbnail
              key={`eks-${i}`}
              src={url}
              erForside={i === 0 && bilder.length === 0}
              onFjern={() => onFjernEksisterende(i)}
            />
          ))}
          {bilder.map((b, i) => (
            <BildeThumbnail
              key={`ny-${i}`}
              src={b.url}
              erForside={eksisterendeBilder.length === 0 && i === 0}
              onFjern={() => onFjern(i)}
            />
          ))}
          {total < MAKS_ANTALL_BILDER && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="border-border hover:border-primary/50 flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors"
            >
              <ImageIcon className="text-muted-foreground h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
