import { Children, type ReactNode } from 'react'

/**
 * Listings-rutenett med delte skillelinjer (firkantet rutenett, ingen avrunding).
 *
 * Sideramme og topp kommer fra appens eksisterende rammer (innholds-beholderen har
 * `border-x`, topplinja er filter-barens `border-b`), så rutenettet tegner dem IKKE
 * på nytt — det unngår doble kanter. Hver celle tegner høyre + bunn-kant: høyre gir
 * vertikale skillelinjer (ytterste høyre klippes med `-mr-px` + `overflow-hidden` så
 * den ikke dobles mot beholderens høyre ramme), bunn gir horisontale skillelinjer og
 * den nederste raden lukker rutenettet. Dermed er hver celle innrammet på alle fire
 * sider også når det er 1–4 treff eller en delvis siste rad.
 */
export function ListingGrid({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div className="-mr-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Children.map(children, (child) =>
          child == null ? null : <div className="border-border border-r border-b p-3">{child}</div>
        )}
      </div>
    </div>
  )
}
