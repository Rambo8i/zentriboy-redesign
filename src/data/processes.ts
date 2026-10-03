/**
 * Die fünf Verfahren der Braun GmbH (aus der alten Startseite).
 * Die Beschreibungen erklären das jeweilige Verfahren allgemein und sachlich.
 * Bitte von der Braun GmbH gegenlesen lassen.
 */

export type ProcessId = 'werkzeugbau' | 'vorrichtungen' | 'cnc' | 'erodieren' | 'diaform';

export type Process = {
  id: ProcessId;
  name: string;
  /** Name mit weichen Trennstellen für große Schriftgrade */
  display: string;
  short: string;
  long: string;
  theme: 'paper' | 'graphite';
};

export const processes: Process[] = [
  {
    id: 'werkzeugbau',
    name: 'Werkzeugbau',
    display: 'Werkzeug­bau',
    short:
      'Werkzeuge nach Ihrer Zeichnung: gefertigt, eingepasst und geprüft, bis Maß und Funktion stimmen.',
    long: 'Ein Werkzeug ist nur so gut wie seine Passung. Wir fertigen Werkzeuge nach Ihrer Zeichnung, passen die Einzelteile ein und prüfen, bis Maß und Funktion stimmen.',
    theme: 'paper',
  },
  {
    id: 'vorrichtungen',
    name: 'Vorrichtungen',
    display: 'Vorrich­tungen',
    short: 'Vorrichtungen halten Werkstücke sicher und reproduzierbar in Lage. Jedes Teil liegt an derselben Stelle, jedes Mal.',
    long: 'Eine gute Vorrichtung erkennt man daran, dass das Werkstück jedes Mal gleich liegt. Wir bauen Vorrichtungen, die Teile sicher spannen und reproduzierbar positionieren, damit Bearbeitung und Prüfung wiederholbar werden.',
    theme: 'paper',
  },
  {
    id: 'cnc',
    name: 'CNC-Bearbeitung',
    display: 'CNC-Bear­beitung',
    short: 'CNC-gesteuerte Bearbeitung setzt die Zeichnung Bahn für Bahn in Metall um, wiederholgenau vom ersten bis zum letzten Teil.',
    long: 'Von der Zeichnung über das Programm zum Teil: CNC-gesteuerte Bearbeitung bringt Konturen, Taschen und Bohrungen Bahn für Bahn ins Material. Das Ergebnis ist wiederholgenau, vom ersten bis zum letzten Teil.',
    theme: 'paper',
  },
  {
    id: 'erodieren',
    name: 'Erodieren',
    display: 'Erodieren',
    short: 'Funken statt Fräser: Elektrische Entladungen tragen Material berührungslos ab, auch in gehärtetem Stahl.',
    long: 'Wo ein Fräser an Grenzen kommt, arbeitet der Funke. Beim Erodieren tragen elektrische Entladungen Material berührungslos ab: präzise, ohne Schnittkräfte und unabhängig von der Härte des Werkstoffs.',
    theme: 'graphite',
  },
  {
    id: 'diaform',
    name: 'Diaformschleifen',
    display: 'Diaform­schleifen',
    short: 'Ein Diamant profiliert die Schleifscheibe nach einer vergrößerten Zeichnung. Der Pantograph überträgt die Kontur verkleinert.',
    long: 'Für Profile mit feinen Radien und Winkeln. Ein Taster folgt einer vergrößerten Zeichnung, der Pantograph überträgt die Bewegung verkleinert auf einen Diamanten. Der profiliert die Schleifscheibe, und die Scheibe schleift die Form ins Werkstück.',
    theme: 'graphite',
  },
];
