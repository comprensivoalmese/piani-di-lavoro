'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../js/model.js');
const D = require('../js/documento.js');
const C = require('../js/conversione.js');

// Modello simile a quello dell'IC Almese: sezioni con titoli e voci della scuola.
const modelloScuola = () => {
  const m = M.normalizzaModello(null);
  const metodi = m.sezioni.find((s) => s.id === 'metodologie');
  metodi.titolo = 'Metodi';
  metodi.opzioni = ['Lezione partecipata', 'Esercitazioni individuali', 'Cooperative learning', 'Peer tutoring', 'Attività di laboratorio'];
  const verifiche = m.sezioni.find((s) => s.id === 'verifiche');
  verifiche.opzioni = [
    'Osservazione: comportamento dell\'alunno durante il lavoro in classe',
    'Verifica formativa: controllo del lavoro svolto a casa',
    'Verifica sommativa: domande orali',
    'Verifica sommativa: prove pratiche'
  ];
  m.livelli = ['Avanzato (9-10)', 'Intermedio (7-8)', 'Base (6)', 'In via di prima acquisizione (4-5)'];
  return m;
};

// Struttura di un vecchio piano di musica (testo come esce da Word).
const vecchioPiano = [
  'PROGRAMMAZIONE EDUCATIVO-DIDATTICA',
  'di MUSICA',
  'Classe 1° sezione A',
  'Anno scolastico 2025/2026',
  'Professoressa Rossi Maria',
  'Caratteristiche della classe (situazione iniziale e casi particolari)',
  'Numero di allievi: 20',
  'Strumenti attivati per individuare la situazione di partenza',
  'osservazioni sistematiche',
  'Avanzato: 4',
  'Obiettivi specifici della disciplina',
  'Traguardi per lo sviluppo delle competenze al termine della Scuola secondaria di primo grado',
  'In base agli obiettivi enunciati nelle Indicazioni per il curricolo, l\'insegnamento di Musica propone i seguenti traguardi:',
  '• L\'alunno partecipa in modo attivo alla realizzazione di esperienze musicali attraverso l\'esecuzione e l\'interpretazione di brani strumentali e vocali appartenenti a generi e culture differenti.',
  'OBIETTIVI (CONOSCENZE E ABILITÀ)',
  'Comprendere e usare i linguaggi specifici',
  '• Riconoscere e analizzare i suoni secondo i quattro parametri (altezza, durata, timbro e intensità)',
  '• Comporre semplici jingle pubblicitari',
  'Obiettivi minimi',
  '- Eseguire in gruppo semplici brani',
  'METODI',
  '- Lezione partecipata',
  '- Cooperative learning',
  '- Debate in classe',
  'Verifiche',
  'Il processo di apprendimento degli alunni sarà monitorato mediante:',
  'Osservazione',
  '- Comportamento dell\'alunno durante il lavoro in classe',
  'Verifica sommativa',
  '- Domande orali',
  'Lavagna luminosa',
  'Criteri di valutazione',
  'Verifiche orali:',
  '- Capacità espositiva',
  'Le valutazioni relative alle prove di qualsiasi tipo saranno espresse con una scala numerica in decimi, in modo il più possibile formativo.',
  'Contenuti',
  'ACUSTICA',
  '* La produzione del suono',
  '* Il paesaggio sonoro della valle',
  'STRUMENTI, VOCI E ORCHESTRA',
  '* Gli aerofoni',
  'Almese, 06/10/2025',
  'L\'insegnante Maria Rossi'
];

test('confronto tra testi: radici, parole vuote e accenti', () => {
  assert.deepEqual(C.gettoni('Le verifiche orali'), C.gettoni('verifica orale'));
  assert.equal(C.normalizza('Attività'), 'attivita');
  assert.ok(C.somiglianza('Domande orali', 'Verifica sommativa: domande orali') > 0.6);
  assert.ok(C.somiglianza('Lezione partecipata', 'Esercitazioni individuali') < 0.2);
});

test('pulizia delle righe: segni di elenco, numerazione e caselle non spuntate', () => {
  const righe = C.pulisciRighe(['• Prima voce', { testo: '1. Titolo numerato', titolo: true }, { testo: 'Non spuntata', spuntata: false }, '   ', '12', 'a) Voce\nsu due righe']);
  assert.deepEqual(righe.map((r) => r.testo), ['Prima voce', 'Titolo numerato', 'Voce', 'su due righe']);
  assert.equal(righe[1].titolo, true);
});

test('titoli delle sezioni riconosciuti anche con nomi diversi', () => {
  const m = modelloScuola();
  const id = (t) => (C.trovaSezione(t, m.sezioni) || {}).id;
  assert.equal(id('METODI'), 'metodologie');
  assert.equal(id('Metodologie didattiche'), 'metodologie');
  assert.equal(id('Criteri di valutazione'), 'valutazione');
  assert.equal(id('Obiettivi minimi'), 'obiettiviMinimi');
  assert.equal(id('OBIETTIVI (CONOSCENZE E ABILITÀ)'), 'obiettivi');
  assert.equal(id('Contenuti'), 'argomenti');
  assert.equal(id('Programma svolto'), 'argomenti');
  assert.equal(id('Caratteristiche della classe (situazione iniziale e casi particolari)'), 'situazione');
  assert.equal(id('Verifiche orali'), undefined, 'un sottotitolo non è un capitolo');
  assert.equal(id('MUSICA'), undefined);
});

test('dati del piano letti dall\'intestazione', () => {
  const m = modelloScuola();
  const dati = C.estraiDati(C.pulisciRighe(vecchioPiano), m);
  assert.deepEqual(dati, { docente: 'Rossi Maria', disciplina: 'Musica', classe: '1', sezione: 'A', anno: '2025/2026' });
  assert.equal(C.estraiDati(C.pulisciRighe(['Disciplina: Scienze motorie', 'classe terza', 'a.s. 2024-25']), m).disciplina, 'Educazione fisica');
  assert.deepEqual(C.estraiDati(C.pulisciRighe(['Classe: III', 'Sez. B', 'a.s. 2024-25']), m), { docente: '', disciplina: '', classe: '3', sezione: 'B', anno: '2024/2025' });
});

test('un vecchio piano viene ricostruito secondo il modello', () => {
  const m = modelloScuola();
  const r = C.converti(vecchioPiano, m, { inBanca: true });
  const v = r.piano.valori;
  assert.equal(r.piano.disciplina, 'Musica');
  assert.equal(r.piano.classe, '1');
  assert.equal(v.situazione.num.alunni, '20');
  assert.equal(v.situazione.livelli['Avanzato (9-10)'], '4');
  assert.deepEqual(v.situazione.sel, ['Osservazioni sistematiche']);
  // Traguardi e obiettivi riconosciuti nelle banche della disciplina.
  assert.equal(v.traguardi.sel.length, 1);
  assert.ok(v.obiettivi.sel.includes('Riconoscere e analizzare i suoni secondo i quattro parametri (altezza, durata, timbro e intensità)'));
  assert.deepEqual(v.obiettiviMinimi.sel, ['Eseguire in gruppo semplici brani']);
  // Voci della scuola spuntate; quelle in più restano scritte nel piano.
  assert.deepEqual(v.metodologie.sel, ['Lezione partecipata', 'Cooperative learning']);
  assert.equal(v.metodologie.altro, 'Debate in classe');
  assert.deepEqual(v.verifiche.sel, ['Osservazione: comportamento dell\'alunno durante il lavoro in classe', 'Verifica sommativa: domande orali']);
  assert.equal(v.verifiche.altro, 'Lavagna luminosa', 'una voce breve resta una voce; le etichette no');
  // I sottotitoli dei criteri di valutazione non aprono la sezione delle verifiche.
  assert.equal(v.valutazione.altro, 'Capacità espositiva');
  assert.match(v.valutazione.note, /scala numerica in decimi, in modo il più possibile formativo/);
  // Argomenti: quelli della banca vengono spuntati, gli altri entrano nella banca personale.
  assert.ok(v.argomenti.sel.includes('La produzione del suono'));
  assert.ok(v.argomenti.sel.includes('Gli aerofoni'));
  assert.ok(v.argomenti.sel.includes('Il paesaggio sonoro della valle'));
  assert.deepEqual(r.aggiunteBanca, [
    { catalogo: 'obiettivi', titolo: 'Comprendere e usare i linguaggi specifici', voce: 'Comporre semplici jingle pubblicitari' },
    { catalogo: 'argomenti', titolo: 'Acustica', voce: 'Il paesaggio sonoro della valle' }
  ]);
  assert.ok(r.nonCollocati.some((t) => /monitorato mediante/.test(t)));
  assert.ok(r.riepilogo.find((x) => x.id === 'metodologie').riconosciute === 2);
  // Il piano ottenuto si stampa senza errori.
  assert.match(D.renderPiano(r.piano, m), /Il paesaggio sonoro della valle/);
});

test('i dati scelti dal docente prevalgono su quelli letti; senza banca le voci in più restano nel piano', () => {
  const m = modelloScuola();
  const r = C.converti(vecchioPiano, m, { dati: { classe: '2', sezione: 'C', docente: 'Maria Rossi' } });
  assert.equal(r.piano.classe, '2');
  assert.equal(r.piano.sezione, 'C');
  assert.equal(r.piano.docente, 'Maria Rossi');
  assert.equal(r.letti.classe, '1');
  assert.deepEqual(r.aggiunteBanca, []);
  assert.match(r.piano.valori.argomenti.altro, /Il paesaggio sonoro della valle/);
});
