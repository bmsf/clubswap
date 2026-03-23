// Simple i18n helper — Norwegian first, English fallback.
// Replace with next-intl or similar when full i18n is needed.

const translations: Record<string, string> = {
  // Navigation
  'nav.browse': 'Bla gjennom',
  'nav.sell': 'Selg utstyr',
  'nav.login': 'Logg inn',
  'nav.register': 'Registrer deg',
  'nav.dashboard': 'Min side',
  'nav.logout': 'Logg ut',

  // Hero
  'hero.eyebrow': 'Laget av golfere. For golfere.',
  'hero.headline': 'Kjøp og selg golfutstyr — direkte mellom golfere',
  'hero.subheadline':
    'Ingen mellommenn. Ingen oppblåste priser. Bare brukt golfutstyr fra folk som faktisk spiller — i Norge, Sverige, Danmark og Finland.',
  'hero.search.placeholder': 'Søk etter klubber, bager, sko...',
  'hero.cta.browse': 'Se alle annonser',
  'hero.cta.sell': 'Legg ut utstyr',

  // Conditions
  'condition.mint': 'Perfekt',
  'condition.very_good': 'Meget bra',
  'condition.good': 'Bra',
  'condition.fair': 'Akseptabel',

  'condition.mint.description': 'Brukt 1–2 ganger. Ingen merker. Ikke til å se fra ny.',
  'condition.very_good.description':
    'Lette ripestrekmerker eller mindre merker. Spor fullt intakt.',
  'condition.good.description':
    'Normal slitasje for brukt klubb. Kosmetiske merker, men fullt spillbar.',
  'condition.fair.description':
    'Synlig slitasje, riper eller eldre modell. Priset deretter. Fullt funksjonell.',

  // Categories
  'category.driver': 'Driver',
  'category.fairway_wood': 'Fairwaykølle',
  'category.hybrid': 'Hybrid',
  'category.irons': 'Jern',
  'category.wedge': 'Wedge',
  'category.putter': 'Putter',
  'category.bag': 'Bag',
  'category.shoes': 'Sko',
  'category.clothing': 'Klær',
  'category.accessories': 'Tilbehør',
  'category.other': 'Annet',

  // How it works
  'how.title': 'Slik fungerer det',
  'how.step1.title': 'Legg ut på 2 minutter',
  'how.step1.desc':
    'Ta noen bilder, skriv litt om tilstanden og sett en pris du er fornøyd med. Så enkelt er det.',
  'how.step2.title': 'Kjøperen tar kontakt',
  'how.step2.desc':
    'Interesserte golfere sender deg melding direkte. Du svarer når det passer deg.',
  'how.step3.title': 'Avtal og lever',
  'how.step3.desc':
    'Dere bestemmer selv — henting, post eller møt opp på banen. Pengene går rett til deg.',

  // Listings
  'listings.title': 'Alle annonser',
  'listings.filters.title': 'Filtrer',
  'listings.filters.category': 'Kategori',
  'listings.filters.condition': 'Tilstand',
  'listings.filters.price': 'Pris',
  'listings.filters.location': 'Sted',
  'listings.filters.shaft_flex': 'Skaftflex',
  'listings.empty': 'Ingen annonser funnet',
  'listings.views': 'visninger',

  // Common
  'common.currency.NOK': 'kr',
  'common.currency.SEK': 'kr',
  'common.currency.DKK': 'kr',
  'common.currency.EUR': '€',
  'common.verified_golfer': 'Verifisert golfer',
}

export function t(key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key
}
