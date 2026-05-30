import { redirect } from 'next/navigation'

// Søk er ikke lenger en egen side — det er bare et filter på /utforsk.
// Gamle /search/<term>-lenker sendes videre dit.
export default async function SearchRedirect({ params }: { params: Promise<{ query: string }> }) {
  const { query } = await params
  redirect(`/utforsk?sok=${encodeURIComponent(query)}`)
}
