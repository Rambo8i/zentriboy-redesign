/**
 * Firmendaten – übernommen aus Impressum und Firmenseite der alten Website.
 * Eine Quelle für alle Seiten (Header, Schriftfeld, Kontakt, Impressum, JSON-LD).
 */

export const company = {
  name: 'Braun GmbH',
  street: 'Württembergerstr. 14',
  postalCode: '78567',
  city: 'Fridingen',
  region: 'an der Donau',
  country: 'Deutschland',
  countryCode: 'DE',
  phone: { display: '07463 8088', intl: '+49 7463 8088', href: 'tel:+4974638088' },
  fax: { display: '07463 5007', intl: '+49 7463 5007' },
  email: 'info@zentriboy.de',
  web: 'www.zentriboy.de',
  managingDirector: 'Ralph Braun',
  /**
   * Fehlen im alten Impressum. Für ein vollständiges Impressum nach § 5 DDG ergänzen,
   * dann erscheinen sie automatisch auf der Impressumsseite.
   */
  register: null as null | { court: string; number: string },
  vatId: null as null | string,
  services: ['Werkzeugbau', 'Vorrichtungen', 'CNC-Bearbeitung', 'Erodieren', 'Diaformschleifen'],
} as const;

export const site = {
  title: 'Braun GmbH',
  description:
    'Braun GmbH, Werkzeugbau in Fridingen an der Donau: Werkzeugbau, Vorrichtungen, CNC-Bearbeitung, Erodieren und Diaformschleifen. Hersteller von ZentriBoy und Tensiometer.',
  locale: 'de_DE',
} as const;

export type NavItem = { href: string; label: string };

/*
 * Links mit abschließendem Schrägstrich: So liegen die Seiten im Build (/zentriboy/index.html),
 * so lauten Canonical und Sitemap, und so leiten weder Apache noch Vercel um.
 */
export const nav: NavItem[] = [
  { href: '/fertigung/', label: 'Fertigung' },
  { href: '/werkstatt/', label: 'Werkstatt' },
  { href: '/zentriboy/', label: 'ZentriBoy' },
  { href: '/tensiometer/', label: 'Tensiometer' },
  { href: '/kontakt/', label: 'Kontakt' },
];

/** Pfad ohne abschließende Schrägstriche, für Vergleiche ("/zentriboy/" → "/zentriboy") */
export const normalizePath = (pathname: string): string => pathname.replace(/\/+$/, '') || '/';

/** Seitennamen für die Seitenblende und das Schriftfeld. */
export const routeLabels: Record<string, string> = {
  '/': 'Braun GmbH',
  '/fertigung': 'Fertigung',
  '/werkstatt': 'Werkstatt',
  '/zentriboy': 'ZentriBoy',
  '/tensiometer': 'Tensiometer',
  '/kontakt': 'Kontakt',
  '/impressum': 'Impressum',
  '/datenschutz': 'Datenschutz',
};

export function labelForPath(pathname: string): string {
  return routeLabels[normalizePath(pathname)] ?? 'Braun GmbH';
}

/**
 * Rechtliches. `privacyReviewed` auf `true` setzen, sobald die Datenschutzerklärung
 * rechtlich geprüft ist – dann verschwindet der Entwurfshinweis auf der Seite.
 */
export const legal = {
  privacyReviewed: false,
  privacyDate: 'September 2026',
} as const;

/** mailto-Link mit Betreff und optionalem Text (sauber kodiert). */
export function mailto(subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  // URLSearchParams kodiert Leerzeichen als „+“, Mailprogramme erwarten „%20“.
  return `mailto:${company.email}?${params.toString().replace(/\+/g, '%20')}`;
}

export const inquiryMail = mailto(
  'Anfrage Fertigung',
  'Guten Tag,\n\nich habe eine Anfrage zu folgendem Teil:\n\nZeichnung/Muster: \nStückzahl: \nWerkstoff: \nWunschtermin: \n\nMit freundlichen Grüßen\n',
);
