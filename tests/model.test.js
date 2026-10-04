'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const defaults = require('../js/defaults.js');
const M = require('../js/model.js');
const D = require('../js/documento.js');

const modello = () => M.normalizzaModello(null);
const sezione = (m, id) => m.sezioni.find((s) => s.id === id);

test('anno scolastico: da agosto inizia il nuovo anno', () => {
  assert.equal(defaults.annoScolasticoCorrente(new Date(2026, 8, 29)), '2026/2027');
  assert.equal(defaults.annoScolasticoCorrente(new Date(2027, 2, 1)), '2026/2027');
  assert.equal(defaults.annoScolasticoCorrente(new Date(2027, 7, 1)), '2027/2028');
});

test('il modello predefinito contiene discipline con traguardi e nuclei', () => {
  const m = modello();
  assert.equal(m.sezioni[0].tipo, 'dati');
  assert.ok(m.discipline.length >= 12);
  m.discipline.forEach((d) => {
    assert.ok(d.traguardi.length > 0, d.nome + ' senza traguardi');
    assert.ok(d.nuclei.length > 0, d.nome + ' senza nuclei');
  });
  const ids = m.sezioni.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'id delle sezioni duplicati');
});

test('normalizzaModello rimette la sezione dati in testa e scarta voci non valide', () => {
  const m = M.normalizzaModello({
    schema: 2,
    sezioni: [
      { id: 'x', tipo: 'checklist', titolo: 'X', opzioni: ['a', '', '  b '] },
      { id: 'y', tipo: 'sconosciuto' },
      { id: 'dati', tipo: 'dati', titolo: 'Dati', attiva: false },
      { id: 'x', tipo: 'testo' }
    ],
    discipline: [{ nome: 'Italiano' }, { nome: 'italiano' }, { nome: '' }]
  });
  assert.deepEqual(m.sezioni.map((s) => s.id), ['dati', 'x']);
  assert.equal(m.sezioni[0].attiva, true);
  assert.deepEqual(m.sezioni[1].opzioni, ['a', 'b']);
  assert.equal(m.discipline.length, 1);
});

test('nuovoPiano precompila ore dalla disciplina e testi predefiniti', () => {
  const m = modello();
  const p = M.nuovoPiano(m, { docente: 'Rossi', disciplina: 'Matematica', classe: '2', sezione: 'b' });
  assert.equal(p.ore, '4');
  assert.equal(p.sezione, 'B');
  assert.equal(p.anno, m.scuola.annoScolastico);
  assert.match(p.valori.valutazione.note, /D\.Lgs\. 62\/2017/);
  assert.equal(M.titoloPiano(p), 'Matematica – classe 2B');
});

test('elencoSezioniClasse separa e deduplica', () => {
  assert.deepEqual(M.elencoSezioniClasse('a, B;c b  /d'), ['A', 'B', 'C', 'D']);
  assert.deepEqual(M.elencoSezioniClasse('  '), []);
});

test('avanzamento e completamento delle sezioni', () => {
  const m = modello();
  const p = M.nuovoPiano(m, { docente: 'Rossi', disciplina: 'Italiano', classe: '1', sezione: 'A' });
  const iniziale = M.avanzamento(p, m);
  // Solo i dati generali: un testo predefinito non basta a considerare compilata una sezione.
  assert.equal(iniziale.fatte, 1);
  assert.equal(sezione(m, 'note').facoltativa, true, 'le osservazioni sono facoltative');
  p.valori.metodologie.sel.push('Lezione frontale');
  p.valori.situazione.num.alunni = '22';
  p.valori.uda.unita.push(Object.assign(M.nuovaUnita(), { titolo: 'Il testo narrativo' }));
  assert.equal(M.avanzamento(p, m).fatte, iniziale.fatte + 3);
  assert.equal(M.sezioneCompleta(p, sezione(m, 'traguardi')), false);
  p.valori.traguardi.altro = 'Traguardo personalizzato';
  assert.equal(M.sezioneCompleta(p, sezione(m, 'traguardi')), true);
});

test('copiaContenuti azzera la situazione di partenza', () => {
  const m = modello();
  const a = M.nuovoPiano(m, { docente: 'Rossi', disciplina: 'Storia', classe: '3', sezione: 'A' });
  a.valori.situazione.num.alunni = '20';
  a.valori.metodologie.sel = ['Debate'];
  const b = M.copiaContenuti(M.nuovoPiano(m, { docente: 'Rossi', disciplina: 'Storia', classe: '3', sezione: 'B' }), a, m);
  assert.deepEqual(b.valori.metodologie.sel, ['Debate']);
  assert.equal(b.valori.situazione.num.alunni, undefined);
  b.valori.metodologie.sel.push('CLIL');
  assert.deepEqual(a.valori.metodologie.sel, ['Debate'], 'la copia non deve condividere riferimenti');
});

test('avvisi di coerenza della situazione di partenza', () => {
  const v = { num: { alunni: 20, maschi: 10, femmine: 9 }, livelli: { Base: 5, Iniziale: 5 } };
  const avvisi = M.avvisiSituazione(v, ['Avanzato', 'Intermedio', 'Base', 'Iniziale']);
  assert.equal(avvisi.length, 2);
  assert.deepEqual(M.avvisiSituazione({ num: { alunni: 3, maschi: 1, femmine: 2 }, livelli: {} }, []), []);
});

test('leggiPacchetto riconosce modelli e piani e rifiuta file estranei', () => {
  const m = modello();
  const p = M.nuovoPiano(m, { disciplina: 'Musica' });
  assert.equal(M.leggiPacchetto(JSON.stringify(M.pacchettoModello(m))).tipo, 'modello');
  const letti = M.leggiPacchetto(JSON.stringify(M.pacchettoPiani([p])));
  assert.equal(letti.tipo, 'piani');
  assert.equal(letti.piani[0].id, p.id);
  assert.ok(M.leggiPacchetto('non json').errore);
  assert.ok(M.leggiPacchetto('{"a":1}').errore);
});

test('unisciPiani: a parità di id prevale il più recente', () => {
  const vecchio = { id: 'a', modificato: '2026-01-01', docente: 'x' };
  const nuovo = { id: 'a', modificato: '2026-02-01', docente: 'y' };
  const r = M.unisciPiani([vecchio], [nuovo, { id: 'b', modificato: '2026-01-01' }]);
  assert.equal(r.piani.length, 2);
  assert.equal(r.piani[0].docente, 'y');
  assert.deepEqual(r.stat, { aggiunti: 1, aggiornati: 1, ignorati: 0 });
  assert.equal(M.unisciPiani(r.piani, [vecchio]).stat.ignorati, 1);
});

test('il documento contiene i dati inseriti e ne esegue l\'escape', () => {
  const m = modello();
  m.scuola.nome = 'IC <Test>';
  const p = M.nuovoPiano(m, { docente: 'Anna "Bianchi"', disciplina: 'Tecnologia', classe: '1', sezione: 'C' });
  p.valori.metodologie.sel = ['Problem solving', 'Voce <script>alert(1)</script>'];
  p.valori.traguardi.sel = [M.trovaDisciplina(m, 'Tecnologia').traguardi[0]];
  p.valori.uda.unita.push({ titolo: 'Disegno tecnico', periodo: 'Ottobre', ore: '8', nuclei: ['Prevedere, immaginare e progettare'], obiettivi: 'Usare squadre\nUsare il compasso', contenuti: '' });
  const html = D.renderPiano(p, m);
  assert.match(html, /IC &lt;Test&gt;/);
  assert.match(html, /Anna &quot;Bianchi&quot;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Problem solving/);
  assert.match(html, /Disegno tecnico/);
  assert.match(html, /Usare squadre<br>Usare il compasso/);
  assert.match(html, /Sezione non compilata/);
  const word = D.documentoWord([p, p], m);
  assert.match(word, /urn:schemas-microsoft-com:office:word/);
  assert.equal((word.match(/page-break-before/g) || []).length, 1);
});

test('le sezioni disattivate non compaiono nel documento', () => {
  const m = modello();
  sezione(m, 'famiglie').attiva = false;
  const p = M.nuovoPiano(m, { disciplina: 'Italiano' });
  assert.doesNotMatch(D.renderPiano(p, m), /Rapporti con le famiglie/);
});

test('nomeFile produce un nome valido', () => {
  const p = { disciplina: 'Arte e immagine', classe: '3', sezione: 'A', anno: '2026/2027' };
  assert.equal(M.nomeFile(p, 'doc'), 'Piano di lavoro - Arte e immagine - 3A - 2026-2027.doc');
});

test('ogni disciplina predefinita propone argomenti per le tre classi', () => {
  const m = modello();
  m.discipline.forEach((d) => {
    M.CLASSI.forEach((c) => assert.ok(d.argomenti[c].length > 0, `${d.nome}: nessun argomento per la classe ${c}`));
  });
  const musica = M.trovaDisciplina(m, 'Musica');
  assert.deepEqual(musica.argomenti['1'].map((g) => g.titolo), ['Acustica', 'Strumenti, voci e orchestra', 'Lettura', 'Produzione']);
  assert.ok(musica.argomenti['3'][0].voci.includes('Il Jazz'));
});

test('leggiArgomenti e testoArgomenti sono l\'uno l\'inverso dell\'altro', () => {
  const gruppi = M.leggiArgomenti('Senza gruppo\n\nAcustica:\n  Il suono \nVuoto:\nStoria:\nIl Barocco');
  assert.deepEqual(gruppi, [
    { titolo: '', voci: ['Senza gruppo'] },
    { titolo: 'Acustica', voci: ['Il suono'] },
    { titolo: 'Storia', voci: ['Il Barocco'] }
  ]);
  assert.deepEqual(M.leggiArgomenti(M.testoArgomenti(gruppi)), gruppi);
});

test('gruppiArgomenti mette prima la classe del piano', () => {
  const m = modello();
  const p = M.nuovoPiano(m, { disciplina: 'Musica', classe: '2', sezione: 'A' });
  const gruppi = M.gruppiArgomenti(m, p);
  assert.equal(gruppi[0].classe, '2');
  assert.ok(gruppi.filter((g) => g.propria).every((g) => g.classe === '2'));
  assert.ok(gruppi.some((g) => g.classe === '3' && !g.propria));
  p.classe = '';
  assert.ok(M.gruppiArgomenti(m, p).every((g) => g.propria), 'senza classe sono tutti proposti');
  assert.deepEqual(M.gruppiArgomenti(m, { disciplina: 'Inesistente' }), []);
});

test('argomenti scelti: raggruppati nell\'ordine del modello, con le voci aggiunte a mano', () => {
  const m = modello();
  const sez = sezione(m, 'argomenti');
  const p = M.nuovoPiano(m, { docente: 'Leto', disciplina: 'Musica', classe: '3', sezione: 'A' });
  assert.equal(M.sezioneCompleta(p, sez), false);
  // Il Barocco è un argomento di seconda: va nel gruppo omonimo, non in uno nuovo.
  p.valori.argomenti.sel = ['Il Jazz', 'Le scale musicali', 'Il Classicismo', 'Il Barocco', 'Voce sparita'];
  p.valori.argomenti.altro = 'Musica e cinema';
  assert.equal(M.sezioneCompleta(p, sez), true);
  const r = M.argomentiScelti(p, sez, m);
  assert.deepEqual(r.gruppi, [
    { titolo: 'Storia della musica', voci: ['Il Classicismo', 'Il Jazz', 'Il Barocco'] },
    { titolo: 'Lettura e produzione', voci: ['Le scale musicali'] }
  ]);
  assert.deepEqual(r.altri, ['Voce sparita', 'Musica e cinema']);
  const html = D.renderPiano(p, m);
  assert.match(html, /Contenuti: argomenti trattati/);
  assert.match(html, /Storia della musica<\/p><ul><li>Il Classicismo<\/li><li>Il Jazz/);
  assert.match(html, /Altri argomenti<\/p><ul><li>Voce sparita<\/li><li>Musica e cinema/);
});

test('un modello salvato con la versione precedente riceve sezione e argomenti', () => {
  const vecchio = M.normalizzaModello(null);
  vecchio.schema = 1;
  vecchio.sezioni = vecchio.sezioni.filter((s) => s.tipo !== 'argomenti');
  vecchio.discipline.forEach((d) => { delete d.argomenti; });
  vecchio.discipline.push({ nome: 'Coro', nuclei: [], traguardi: [] });
  const m = M.normalizzaModello(JSON.parse(JSON.stringify(vecchio)));
  assert.equal(m.schema, 2);
  const ids = m.sezioni.map((s) => s.id);
  assert.equal(ids.indexOf('argomenti'), ids.indexOf('traguardi') + 1);
  assert.ok(M.trovaDisciplina(m, 'Musica').argomenti['1'].length > 0);
  assert.deepEqual(M.trovaDisciplina(m, 'Coro').argomenti, { 1: [], 2: [], 3: [] });
  // Dalla versione 2 le scelte del referente vengono rispettate.
  m.sezioni = m.sezioni.filter((s) => s.tipo !== 'argomenti');
  M.trovaDisciplina(m, 'Musica').argomenti = { 1: [], 2: [], 3: [] };
  const di_nuovo = M.normalizzaModello(JSON.parse(JSON.stringify(m)));
  assert.ok(!di_nuovo.sezioni.some((s) => s.tipo === 'argomenti'));
  assert.deepEqual(M.trovaDisciplina(di_nuovo, 'Musica').argomenti['1'], []);
});

test('banca personale: gli argomenti aggiunti dal docente si uniscono ai gruppi della banca', () => {
  const m = modello();
  const banca = {};
  assert.equal(M.aggiungiABanca(banca, 'Musica', '1', 'acustica', 'Il rumore'), true);
  M.aggiungiABanca(banca, 'Musica', '1', 'Musica e territorio', 'Canti della tradizione');
  M.aggiungiABanca(banca, 'Musica', '1', 'Musica e territorio', 'Canti della tradizione');
  assert.equal(M.aggiungiABanca(banca, 'Musica', '', 'X', 'senza classe'), false);
  assert.equal(M.aggiungiABanca(banca, 'Musica', '1', 'X', '   '), false);
  const p = M.nuovoPiano(m, { disciplina: 'Musica', classe: '1', sezione: 'A' });
  const gruppi = M.gruppiArgomenti(m, p, banca);
  const acustica = gruppi.find((g) => g.titolo === 'Acustica');
  assert.ok(acustica.voci.includes('Il rumore'));
  assert.deepEqual(acustica.personali, ['Il rumore']);
  const territorio = gruppi.filter((g) => g.titolo === 'Musica e territorio');
  assert.equal(territorio.length, 1);
  assert.deepEqual(territorio[0].voci, ['Canti della tradizione']);
  assert.equal(territorio[0].propria, true);
  // In un piano di terza gli argomenti personali di prima sono tra quelli delle altre classi.
  const p3 = M.nuovoPiano(m, { disciplina: 'Musica', classe: '3', sezione: 'A' });
  assert.equal(M.gruppiArgomenti(m, p3, banca).find((g) => g.titolo === 'Musica e territorio').propria, false);
  // Nel documento gli argomenti personali stanno nel loro gruppo.
  p.valori.argomenti.sel = ['Il rumore', 'Canti della tradizione'];
  const r = M.argomentiScelti(p, sezione(m, 'argomenti'), m, banca);
  assert.deepEqual(r.gruppi, [
    { titolo: 'Acustica', voci: ['Il rumore'] },
    { titolo: 'Musica e territorio', voci: ['Canti della tradizione'] }
  ]);
  assert.deepEqual(r.altri, []);
  assert.match(D.renderPiano(p, m, banca), /Musica e territorio<\/p><ul><li>Canti della tradizione/);
  // Senza banca le voci restano comunque nel documento, tra gli altri argomenti.
  assert.deepEqual(M.argomentiScelti(p, sezione(m, 'argomenti'), m).altri, ['Il rumore', 'Canti della tradizione']);
  M.rimuoviDaBanca(banca, 'Musica', '1', 'Il rumore');
  M.rimuoviDaBanca(banca, 'Musica', '1', 'Canti della tradizione');
  assert.deepEqual(banca, {}, 'una disciplina senza argomenti personali sparisce dalla banca');
});

test('banca personale: esportazione con i piani e unione all\'importazione', () => {
  const m = modello();
  const banca = {};
  M.aggiungiABanca(banca, 'Musica', '2', 'Storia della musica', 'Il melodramma');
  M.aggiungiABanca(banca, 'Storia', '1', 'Il Basso Medioevo', 'Le città marinare');
  const p = M.nuovoPiano(m, { disciplina: 'Musica', classe: '2', sezione: 'B' });
  const pacchetto = M.pacchettoPiani([p], M.bancaPerPiani(banca, [p]));
  assert.deepEqual(Object.keys(pacchetto.banca), ['Musica'], 'si esporta solo la banca delle discipline dei piani');
  assert.equal(M.pacchettoPiani([p], {}).banca, undefined);
  const letto = M.leggiPacchetto(JSON.stringify(pacchetto));
  const mia = {};
  M.aggiungiABanca(mia, 'Musica', '2', 'Storia della musica', 'Il Barocco veneziano');
  M.unisciBanca(mia, letto.banca);
  assert.deepEqual(mia.Musica['2'], [{ titolo: 'Storia della musica', voci: ['Il Barocco veneziano', 'Il melodramma'] }]);
  assert.deepEqual(M.leggiPacchetto(JSON.stringify(M.pacchettoPiani([p]))).banca, {});
  assert.deepEqual(M.normalizzaBanca({ '': {}, Vuota: { 1: [] }, Arte: { 1: [{ titolo: 'X', voci: ['a', ''] }] } }),
    { Arte: { 1: [{ titolo: 'X', voci: ['a'] }], 2: [], 3: [] } });
});
