import { Children, type ReactNode } from 'react'

/**
 * Listings-rutenett med delte, kun-interne skillelinjer.
 *
 * Hver celle tegner høyre + bunn-kant → vertikale linjer mellom kolonner og
 * horisontale linjer mellom rader. Negativ margin (`-mr-px -mb-px`) drar de
 * ytterste kantene utenfor og `overflow-hidden` klipper dem bort, så det blir
 * ingen ramme rundt rutenettet. Robust for responsive kolonner og delvis siste rad.
 */
export function ListingGrid({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div className="-mr-px -mb-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Children.map(children, (child) =>
          child == null ? null : (
            <div className="border-r border-b border-neutral-950/10 p-3">{child}</div>
          )
        )}
      </div>
    </div>
  )
}
