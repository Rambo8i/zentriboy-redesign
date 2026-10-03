/**
 * Produkte – Texte und Preise aus der alten Website (zentriboy.html, tensiometer.html).
 * Preise vor Veröffentlichung bitte prüfen: Sie stammen vom alten Stand der Seite.
 */
import { mailto } from './site';

export const shipping = {
  domestic: 7.9,
  domesticNote: 'Versandpauschale inklusive Verpackung, pro Sendung im Inland',
  foreign: 'Ausländische Währungen werden zum Tageskurs umgerechnet.',
} as const;

export type Product = {
  slug: 'zentriboy' | 'tensiometer';
  name: string;
  article: string;
  price: number;
  priceNote: string;
  trade: string;
  question: string;
  answer: string;
  summary: string;
  steps: { verb: string; text: string }[];
  orderMail: string;
};

export const products: Record<Product['slug'], Product> = {
  zentriboy: {
    slug: 'zentriboy',
    name: 'ZentriBoy',
    article: 'Braun ZentriBoy',
    price: 166,
    priceNote: 'inkl. MwSt.',
    trade: 'Rabattliste auf Anfrage',
    question: 'Sie bauen Ihr Rad immer noch aus?',
    answer: 'Das muss nicht sein.',
    summary:
      'Der ZentriBoy ersetzt den Zentrierständer vollkommen. Direkt am Fahrrad festklemmen und sofort zentrieren. Die Messuhr zeigt Ihnen sofort, wenn etwas „falsch“ läuft.',
    steps: [
      { verb: 'Festklemmen', text: 'Den ZentriBoy direkt am Fahrrad festklemmen. Das Laufrad bleibt eingebaut.' },
      { verb: 'Zentrieren', text: 'Rad drehen und sofort zentrieren. Die Bedienung ist sehr einfach.' },
      {
        verb: 'Ablesen',
        text: 'Die Messuhr zeigt jede Abweichung. So können Sie keinen Fehler mehr machen.',
      },
    ],
    orderMail: mailto(
      'Bestellung ZentriBoy',
      'Guten Tag,\n\nhiermit bestelle ich:\n\nArtikel: Braun ZentriBoy\nAnzahl: \n\nName: \nLieferadresse: \n\nMit freundlichen Grüßen\n',
    ),
  },
  tensiometer: {
    slug: 'tensiometer',
    name: 'Tensiometer',
    article: 'Braun Tensiometer',
    price: 145.67,
    priceNote: 'inkl. MwSt.',
    trade: 'Händlerpreis auf Anfrage',
    question: 'Speichenspannung?',
    answer: 'Kein Problem.',
    summary:
      'Einfach das Tensiometer in die Speiche einklicken, den angezeigten Wert ablesen und mit der mitgelieferten Tabelle vergleichen.',
    steps: [
      { verb: 'Einklicken', text: 'Das Tensiometer in die Speiche einklicken.' },
      { verb: 'Ablesen', text: 'Den angezeigten Wert an der Messuhr ablesen.' },
      { verb: 'Vergleichen', text: 'Den Wert mit der mitgelieferten Tabelle vergleichen. Fertig.' },
    ],
    orderMail: mailto(
      'Bestellung Tensiometer',
      'Guten Tag,\n\nhiermit bestelle ich:\n\nArtikel: Braun Tensiometer\nAnzahl: \n\nName: \nLieferadresse: \n\nMit freundlichen Grüßen\n',
    ),
  },
};

const euro = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** „166,00“ – der Betrag ohne Währungszeichen, für getrennte Typografie. */
export function formatAmount(value: number): string {
  return euro.format(value);
}

/** „166,00 €“ mit geschütztem Leerzeichen. */
export function formatPrice(value: number): string {
  return `${euro.format(value)} €`;
}
