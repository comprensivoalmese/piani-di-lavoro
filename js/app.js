/*
 * Interfaccia dell'applicazione: elenco dei piani, compilazione,
 * anteprima/stampa, modello d'istituto e guida.
 */
(function () {
  'use strict';

  const { model: M, documento: D, store: S } = window.PDL;
  const C = window.PDL.config || { googleClientId: '', modelloPubblico: '', scuole: [] };
  const app = document.getElementById('app');

  const stato = {
    modello: null,
    modelloSalvato: false,
    piani: [],
    banca: {},
    utente: null,
    scuola: null,
    selezionati: new Set(),
    filtri: { testo: '', anno: '', classe: '' }
  };

  const NOMI_CLASSI = { 1: 'Prima', 2: 'Seconda', 3: 'Terza' };
  const ETICHETTE_TIPO = {
    dati: 'Intestazione',
    situazione: 'Situazione di partenza',
    checklist: 'Elenco di voci',
    traguardi: 'Traguardi della disciplina',
    argomenti: 'Banca per disciplina e classe',
    uda: 'Tabella UdA',
    testo: 'Testo libero'
  };

  /* ================= Utilità DOM ================= */

  function h(tag, attrs, ...figli) {
    const el = document.createElement(tag);
    let valore;
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'value') valore = v;
      else if (k === 'checked') el.checked = true;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    aggiungi(el, figli);
    // Il valore va impostato dopo le <option>, altrimenti le select lo ignorano.
    if (valore != null) el.value = valore;
    return el;
  }

  function aggiungi(el, figli) {
    figli.flat(Infinity).forEach((f) => {
      if (f == null || f === false) return;
      el.append(f instanceof Node ? f : String(f));
    });
  }

  function bottone(testo, onclick, classe = 'btn', attrs = {}) {
    return h('button', Object.assign({ type: 'button', class: classe, onclick }, attrs), testo);
  }

  function campo(etichetta, controllo, classe = 'campo') {
    return h('label', { class: classe }, h('span', { class: 'etichetta' }, etichetta), controllo);
  }

  function areaTesto(valore, oninput, attrs = {}) {
    return h('textarea', Object.assign({ rows: 3, oninput: (e) => { adatta(e.target); oninput(e.target.value); } }, attrs), valore || '');
  }

  function adatta(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight + 2, 600) + 'px';
  }

  function adattaTutte(radice = app) {
    radice.querySelectorAll('textarea').forEach(adatta);
  }

  function selezione(opzioni, valore, onchange, attrs = {}) {
    return h('select', Object.assign({ value: valore, onchange: (e) => onchange(e.target.value) }, attrs),
      opzioni.map((o) => (typeof o === 'string' ? h('option', { value: o }, o) : h('option', { value: o.valore }, o.testo))));
  }

  function toast(messaggio, tipo = 'ok') {
    const box = document.getElementById('avvisi');
    const el = h('div', { class: 'toast ' + tipo }, messaggio);
    box.append(el);
    setTimeout(() => el.classList.add('via'), 3800);
    setTimeout(() => el.remove(), 4300);
  }

  function scarica(nome, contenuto, tipo) {
    const url = URL.createObjectURL(new Blob([contenuto], { type: tipo }));
    const a = h('a', { href: url, download: nome });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  function chiediFile(accept) {
    return new Promise((risolvi) => {
      const input = h('input', { type: 'file', accept, class: 'nascosto' });
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;
        const lettore = new FileReader();
        lettore.onload = () => risolvi(String(lettore.result));
        lettore.onerror = () => toast('Impossibile leggere il file.', 'errore');
        lettore.readAsText(file, 'utf-8');
      });
      document.body.append(input);
      input.click();
    });
  }

  function dataBreve(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  function barraAvanzamento(av) {
    return h('div', { class: 'progresso', title: `${av.fatte} di ${av.totale} sezioni compilate` },
      h('div', { class: 'progresso-barra' }, h('span', { style: `width:${av.percentuale}%` })),
      h('span', { class: 'progresso-testo' }, av.percentuale + '%'));
  }

  function nomeClasse(p) {
    return (p.classe || '') + (p.sezione || '');
  }

  /* ================= Salvataggio ================= */

  let timerPiani = null;
  let timerModello = null;

  function salvaPianiOra() {
    clearTimeout(timerPiani);
    timerPiani = null;
    const ok = S.salvaPiani(stato.piani);
    const el = document.getElementById('stato-salvataggio');
    if (el) {
      el.textContent = ok ? 'Salvato alle ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'Salvataggio non riuscito';
      el.classList.toggle('errore', !ok);
    }
    if (!ok) toast('Salvataggio non riuscito: la memoria del browser è piena o non disponibile. Esporta subito i piani.', 'errore');
    return ok;
  }

  function programmaSalvataggio() {
    const el = document.getElementById('stato-salvataggio');
    if (el) { el.textContent = 'Salvataggio…'; el.classList.remove('errore'); }
    clearTimeout(timerPiani);
    timerPiani = setTimeout(salvaPianiOra, 400);
  }

  function salvaModelloOra() {
    clearTimeout(timerModello);
    timerModello = null;
    stato.modelloSalvato = true;
    if (!S.salvaModello(stato.modello)) toast('Impossibile salvare il modello nel browser.', 'errore');
    aggiornaTestata();
  }

  function modelloModificato() {
    stato.modello.aggiornato = new Date().toISOString();
    clearTimeout(timerModello);
    timerModello = setTimeout(salvaModelloOra, 400);
  }

  window.addEventListener('pagehide', () => {
    if (timerPiani) salvaPianiOra();
    if (timerModello) salvaModelloOra();
  });

  /* ================= Navigazione ================= */

  function vai(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function render(opzioni = {}) {
    if (timerModello) salvaModelloOra();
    const parti = location.hash.replace(/^#\/?/, '').split('/');
    const vista = parti[0] || 'piani';
    const sezioneNav = vista === 'piano' || vista === 'anteprima' ? 'piani' : vista;
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const attivo = a.dataset.nav === sezioneNav;
      a.classList.toggle('attivo', attivo);
      if (attivo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.classList.toggle('modo-anteprima', vista === 'anteprima');
    const scroll = window.scrollY;
    app.replaceChildren();
    switch (vista) {
      case 'piano': vistaEditor(decodeURIComponent(parti[1] || '')); break;
      case 'anteprima': vistaAnteprima(decodeURIComponent(parti[1] || '').split(',')); break;
      case 'modello': vistaModello(); break;
      case 'guida': vistaGuida(); break;
      default: vistaElenco();
    }
    adattaTutte();
    window.scrollTo(0, opzioni.mantieniScroll ? scroll : 0);
  }

  function aggiornaTestata() {
    const el = document.getElementById('nome-scuola');
    if (el) el.textContent = stato.modello.scuola.nome || '';
  }

  /* ================= Elenco dei piani ================= */

  function intestazioneVista(titolo, sottotitolo, ...azioni) {
    return h('div', { class: 'intestazione-vista' },
      h('div', null, h('h1', null, titolo), sottotitolo ? h('p', { class: 'sottotitolo' }, sottotitolo) : null),
      azioni.length ? h('div', { class: 'azioni' }, azioni) : null);
  }

  // Ricorda al docente che i piani si compilano con il modello della scuola.
  function avvisoModello() {
    const m = stato.modello;
    if (m.bloccato) {
      const data = m.aggiornato ? new Date(m.aggiornato) : null;
      return h('div', { class: 'avviso-modello ok' },
        h('strong', null, 'Modello della scuola in uso' + (m.scuola.nome ? ': ' + m.scuola.nome : '') + '. '),
        'Tutti i docenti compilano i piani con questo modello, senza modificarlo.',
        data && !isNaN(data) ? ` Versione del ${data.toLocaleDateString('it-IT')}.` : '');
    }
    return h('div', { class: 'avviso-modello attenzione', role: 'note' },
      h('strong', null, 'Attenzione: non stai usando il modello della scuola. '),
      accessoAttivo()
        ? 'I piani di lavoro vanno compilati con il modello d\'istituto: premi «Accedi con Google» in alto e usa l\'account della scuola, il modello viene caricato in automatico. In alternativa importa con «Importa file» il modello ricevuto dal referente. '
        : 'I piani di lavoro vanno compilati con il modello d\'istituto preparato dal referente: apri l\'app dal link della scuola, che lo carica in automatico, oppure importa con «Importa file» il modello ricevuto dal referente. ',
      h('span', { class: 'nota' }, 'Se sei il referente e stai preparando il modello, puoi ignorare questo avviso.'));
  }

  function vistaElenco() {
    const n = stato.piani.length;
    app.append(intestazioneVista('I miei piani di lavoro',
      n ? `${n} ${n === 1 ? 'piano salvato' : 'piani salvati'} in questo browser` : null,
      n ? bottone('Backup di tutti i piani', () => esportaPiani(stato.piani, 'Backup piani di lavoro.json')) : null,
      bottone('+ Nuovo piano', () => apriDialogoPiano(), 'btn primario')),
      avvisoModello());

    if (!n) {
      app.append(benvenuto());
      return;
    }

    const anni = [...new Set(stato.piani.map((p) => p.anno).filter(Boolean))].sort().reverse();
    app.append(h('div', { class: 'filtri' },
      h('input', {
        type: 'search', placeholder: 'Cerca per disciplina, docente o classe…', 'aria-label': 'Cerca',
        value: stato.filtri.testo, oninput: (e) => { stato.filtri.testo = e.target.value; disegnaTabella(); }
      }),
      selezione([{ valore: '', testo: 'Tutti gli anni' }].concat(anni.map((a) => ({ valore: a, testo: 'A.S. ' + a }))),
        stato.filtri.anno, (v) => { stato.filtri.anno = v; disegnaTabella(); }, { 'aria-label': 'Anno scolastico' }),
      selezione([{ valore: '', testo: 'Tutte le classi' }, { valore: '1', testo: 'Classi prime' }, { valore: '2', testo: 'Classi seconde' }, { valore: '3', testo: 'Classi terze' }],
        stato.filtri.classe, (v) => { stato.filtri.classe = v; disegnaTabella(); }, { 'aria-label': 'Classe' })),
    h('div', { id: 'tabella-piani' }));
    disegnaTabella();
  }

  function pianiFiltrati() {
    const f = stato.filtri;
    const t = f.testo.trim().toLowerCase();
    return stato.piani
      .filter((p) => (!f.anno || p.anno === f.anno) && (!f.classe || p.classe === f.classe) &&
        (!t || [p.disciplina, p.docente, nomeClasse(p), p.libro].join(' ').toLowerCase().includes(t)))
      .sort((a, b) => b.anno.localeCompare(a.anno) || a.classe.localeCompare(b.classe) ||
        a.sezione.localeCompare(b.sezione) || a.disciplina.localeCompare(b.disciplina));
  }

  function disegnaTabella() {
    const box = document.getElementById('tabella-piani');
    if (!box) return;
    const ids = new Set(stato.piani.map((p) => p.id));
    stato.selezionati.forEach((id) => { if (!ids.has(id)) stato.selezionati.delete(id); });
    const piani = pianiFiltrati();
    const scelti = () => stato.piani.filter((p) => stato.selezionati.has(p.id));
    const tuttiScelti = piani.length > 0 && piani.every((p) => stato.selezionati.has(p.id));

    const barraSelezione = stato.selezionati.size ? h('div', { class: 'barra-selezione' },
      h('strong', null, `${stato.selezionati.size} selezionati`),
      bottone('Anteprima e stampa', () => vai('#/anteprima/' + scelti().map((p) => p.id).join(','))),
      bottone('Scarica in Word', () => scaricaWord(scelti())),
      bottone('Esporta file', () => esportaPiani(scelti(), `Piani di lavoro (${stato.selezionati.size}).json`)),
      bottone('Elimina', () => eliminaPiani(scelti()), 'btn pericolo'),
      bottone('Annulla selezione', () => { stato.selezionati.clear(); disegnaTabella(); }, 'btn-link')) : null;

    const righe = piani.map((p) => {
      const av = M.avanzamento(p, stato.modello);
      return h('tr', null,
        h('td', { class: 'col-check' }, h('input', {
          type: 'checkbox', 'aria-label': 'Seleziona ' + M.titoloPiano(p), checked: stato.selezionati.has(p.id),
          onchange: (e) => { e.target.checked ? stato.selezionati.add(p.id) : stato.selezionati.delete(p.id); disegnaTabella(); }
        })),
        h('td', null, h('a', { href: '#/piano/' + encodeURIComponent(p.id), class: 'link-piano' }, p.disciplina || 'Senza disciplina')),
        h('td', null, nomeClasse(p) || '—'),
        h('td', null, p.docente || '—'),
        h('td', null, p.anno),
        h('td', null, barraAvanzamento(av)),
        h('td', { class: 'data' }, dataBreve(p.modificato)),
        h('td', { class: 'col-azioni' },
          bottone('Anteprima', () => vai('#/anteprima/' + encodeURIComponent(p.id)), 'btn piccolo'),
          bottone('Duplica', () => apriDialogoPiano(p), 'btn piccolo'),
          bottone('Elimina', () => eliminaPiani([p]), 'btn piccolo pericolo')));
    });

    box.replaceChildren(
      barraSelezione || '',
      piani.length ? h('div', { class: 'tabella-scroll' }, h('table', { class: 'tabella' },
        h('thead', null, h('tr', null,
          h('th', { class: 'col-check' }, h('input', {
            type: 'checkbox', 'aria-label': 'Seleziona tutti', checked: tuttiScelti,
            onchange: (e) => { piani.forEach((p) => (e.target.checked ? stato.selezionati.add(p.id) : stato.selezionati.delete(p.id))); disegnaTabella(); }
          })),
          h('th', null, 'Disciplina'), h('th', null, 'Classe'), h('th', null, 'Docente'), h('th', null, 'A.S.'),
          h('th', null, 'Completamento'), h('th', null, 'Ultima modifica'), h('th', null, h('span', { class: 'sr' }, 'Azioni')))),
        h('tbody', null, righe))) : h('p', { class: 'nota' }, 'Nessun piano corrisponde ai filtri.'));
  }

  function benvenuto() {
    return h('div', { class: 'card benvenuto' },
      h('h2', null, 'Benvenuto!'),
      h('p', null, 'Questa app aiuta i docenti della scuola secondaria di primo grado a compilare il piano di lavoro annuale in pochi minuti, con un modello uguale per tutta la scuola.'),
      h('ol', { class: 'passi' },
        h('li', null, h('strong', null, 'Il referente prepara il modello d\'istituto'), ': intestazione della scuola, sezioni del piano, voci degli elenchi, discipline. Poi lo esporta e lo invia ai colleghi.'),
        h('li', null, h('strong', null, 'Ogni docente usa il modello della scuola'), accessoAttivo()
          ? ': accedendo con Google con l\'account della scuola lo riceve in automatico. Poi crea i propri piani: gran parte delle sezioni si compila con un clic.'
          : ': aprendo l\'app dal link della scuola lo riceve in automatico (oppure lo importa con «Importa file»). Poi crea i propri piani: gran parte delle sezioni si compila con un clic.'),
        h('li', null, h('strong', null, 'Il piano si scarica in Word o si stampa in PDF'), ', sempre con la stessa impaginazione.')),
      h('div', { class: 'azioni' },
        bottone('+ Crea il primo piano', () => apriDialogoPiano(), 'btn primario'),
        bottone('Importa un file', importaFile),
        h('a', { class: 'btn', href: '#/modello' }, 'Configura il modello d\'istituto')));
  }

  function eliminaPiani(piani) {
    if (!piani.length) return;
    const msg = piani.length === 1
      ? `Eliminare definitivamente il piano «${M.titoloPiano(piani[0])}»?`
      : `Eliminare definitivamente ${piani.length} piani?`;
    if (!confirm(msg)) return;
    const via = new Set(piani.map((p) => p.id));
    stato.piani = stato.piani.filter((p) => !via.has(p.id));
    via.forEach((id) => stato.selezionati.delete(id));
    salvaPianiOra();
    toast(piani.length === 1 ? 'Piano eliminato.' : `${piani.length} piani eliminati.`);
    vai('#/piani');
  }

  /* ================= Nuovo piano / duplica ================= */

  function apriDialogoPiano(sorgente) {
    const pref = S.preferenze();
    const m = stato.modello;
    const dati = {
      docente: sorgente ? sorgente.docente : (pref.docente || ''),
      disciplina: sorgente ? sorgente.disciplina : '',
      classe: sorgente ? sorgente.classe : '',
      sezione: '',
      anno: m.scuola.annoScolastico,
      ore: sorgente ? sorgente.ore : '',
      libro: sorgente ? sorgente.libro : ''
    };
    let origine = sorgente ? sorgente.id : '';

    const discipline = m.discipline.map((d) => d.nome);
    if (dati.disciplina && !discipline.includes(dati.disciplina)) discipline.push(dati.disciplina);

    const inputOre = h('input', { type: 'number', min: 0, max: 40, value: dati.ore, oninput: (e) => { dati.ore = e.target.value; } });
    const selDisciplina = selezione([{ valore: '', testo: '— scegli —' }].concat(discipline.map((d) => ({ valore: d, testo: d }))),
      dati.disciplina, (v) => {
        dati.disciplina = v;
        const d = M.trovaDisciplina(m, v);
        if (d && d.ore !== '') { dati.ore = String(d.ore); inputOre.value = dati.ore; }
      }, { required: true });

    const altriPiani = stato.piani.slice().sort((a, b) => b.modificato.localeCompare(a.modificato));
    const selOrigine = selezione([{ valore: '', testo: '— nessuno: piano vuoto —' }].concat(altriPiani.map((p) => ({
      valore: p.id, testo: `${M.titoloPiano(p)} · ${p.docente || 'senza docente'} · ${p.anno}`
    }))), origine, (v) => {
      origine = v;
      const p = stato.piani.find((x) => x.id === v);
      if (p && !dati.disciplina) {
        dati.disciplina = p.disciplina;
        selDisciplina.value = p.disciplina;
        if (!dati.ore) { dati.ore = p.ore; inputOre.value = p.ore; }
      }
    });

    const errore = h('p', { class: 'errore-form', role: 'alert' });
    const dlg = h('dialog', { class: 'dialogo', 'aria-labelledby': 'titolo-dialogo' });
    const form = h('form', {
      onsubmit: (e) => {
        e.preventDefault();
        const sezioni = M.elencoSezioniClasse(dati.sezione);
        const mancanti = [];
        if (!dati.docente.trim()) mancanti.push('docente');
        if (!dati.disciplina) mancanti.push('disciplina');
        if (!dati.classe) mancanti.push('classe');
        if (!sezioni.length) mancanti.push('sezione');
        if (mancanti.length) { errore.textContent = 'Compila: ' + mancanti.join(', ') + '.'; return; }
        const src = stato.piani.find((p) => p.id === origine);
        const esistenti = sezioni.filter((sz) => stato.piani.some((p) => p.disciplina === dati.disciplina && p.classe === dati.classe &&
          p.sezione === sz && p.anno === dati.anno.trim() && p.docente.trim().toLowerCase() === dati.docente.trim().toLowerCase()));
        if (esistenti.length && !confirm(`Esiste già un piano di ${dati.disciplina} per ${esistenti.map((s) => dati.classe + s).join(', ')} nello stesso anno. Crearne comunque un altro?`)) return;
        const nuovi = sezioni.map((sz) => {
          const p = M.nuovoPiano(m, Object.assign({}, dati, { sezione: sz }));
          if (src) M.copiaContenuti(p, src, m);
          return p;
        });
        stato.piani.push(...nuovi);
        salvaPianiOra();
        S.salvaPreferenza('docente', dati.docente.trim());
        dlg.close();
        if (nuovi.length === 1) {
          vai('#/piano/' + encodeURIComponent(nuovi[0].id));
          toast(src ? 'Piano creato copiando i contenuti: controlla e completa la situazione di partenza.' : 'Piano creato.');
        } else {
          toast(`Creati ${nuovi.length} piani (${nuovi.map(nomeClasse).join(', ')}).`);
          vai('#/piani');
        }
      }
    },
    h('h2', { id: 'titolo-dialogo' }, sorgente ? 'Duplica piano' : 'Nuovo piano di lavoro'),
    sorgente ? h('p', { class: 'nota' }, `I contenuti di «${M.titoloPiano(sorgente)}» verranno copiati nel nuovo piano. Indica la classe di destinazione.`) : null,
    h('div', { class: 'griglia-2' },
      campo('Docente *', h('input', { type: 'text', value: dati.docente, required: true, autocomplete: 'name', oninput: (e) => { dati.docente = e.target.value; } })),
      campo('Disciplina *', selDisciplina),
      campo('Classe *', selezione([{ valore: '', testo: '— scegli —' }, { valore: '1', testo: 'Prima' }, { valore: '2', testo: 'Seconda' }, { valore: '3', testo: 'Terza' }],
        dati.classe, (v) => { dati.classe = v; }, { required: true })),
      campo('Sezione *', h('input', { type: 'text', value: dati.sezione, required: true, placeholder: 'es. A  oppure  A, B, C', oninput: (e) => { dati.sezione = e.target.value; } })),
      campo('Anno scolastico', h('input', { type: 'text', value: dati.anno, oninput: (e) => { dati.anno = e.target.value; } })),
      campo('Ore settimanali', inputOre)),
    campo('Libro di testo', h('input', { type: 'text', value: dati.libro, oninput: (e) => { dati.libro = e.target.value; } })),
    h('p', { class: 'nota' }, 'Suggerimento: scrivendo più sezioni (es. «A, B, C») si crea un piano per ciascuna classe in un colpo solo.'),
    altriPiani.length ? campo('Copia i contenuti da un piano esistente', selOrigine) : null,
    altriPiani.length ? h('p', { class: 'nota' }, 'Utile per ripartire dal piano dell\'anno scorso o da quello di un collega: vengono copiate tutte le sezioni tranne la situazione di partenza.') : null,
    errore,
    h('div', { class: 'azioni-dialogo' },
      bottone('Annulla', () => dlg.close()),
      h('button', { type: 'submit', class: 'btn primario' }, sorgente ? 'Crea copia' : 'Crea piano')));

    dlg.append(form);
    dlg.addEventListener('close', () => dlg.remove());
    document.body.append(dlg);
    dlg.showModal();
  }

  /* ================= Compilazione del piano ================= */

  function vistaEditor(id) {
    const piano = stato.piani.find((p) => p.id === id);
    if (!piano) {
      app.append(h('div', { class: 'card' }, h('p', null, 'Piano non trovato: potrebbe essere stato eliminato.'), h('a', { href: '#/piani', class: 'btn' }, 'Torna all\'elenco')));
      return;
    }
    const sezioni = M.sezioniAttive(stato.modello);
    let numero = 0;
    const voci = [];
    const schede = [];
    sezioni.forEach((s) => {
      const n = s.tipo === 'dati' ? null : ++numero;
      voci.push(h('li', null, h('a', {
        href: '#sez-' + s.id,
        onclick: (e) => { e.preventDefault(); document.getElementById('sez-' + s.id).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }, h('span', { class: 'pallino', 'data-stato-indice': s.id, 'aria-hidden': 'true' }), (n ? n + '. ' : '') + s.titolo)));
      schede.push(schedaSezione(piano, s, n));
    });

    const barra = h('div', { class: 'barra-editor' },
      h('div', { class: 'barra-titolo' },
        h('a', { href: '#/piani', class: 'indietro', title: 'Torna all\'elenco' }, '← Elenco'),
        h('h1', { id: 'titolo-piano' }, M.titoloPiano(piano)),
        h('span', { id: 'stato-salvataggio', class: 'stato-salvataggio' }, 'Salvato automaticamente')),
      h('div', { class: 'azioni' },
        bottone('Anteprima e stampa', () => { salvaPianiOra(); vai('#/anteprima/' + encodeURIComponent(piano.id)); }, 'btn primario'),
        bottone('Scarica Word', () => scaricaWord([piano])),
        bottone('Duplica', () => apriDialogoPiano(piano)),
        bottone('Esporta file', () => esportaPiani([piano], M.nomeFile(piano, 'json'))),
        bottone('Elimina', () => eliminaPiani([piano]), 'btn pericolo')));

    app.append(h('div', { class: 'editor' },
      h('aside', { class: 'indice' },
        h('div', { id: 'avanzamento-editor' }),
        h('nav', { 'aria-label': 'Sezioni del piano' }, h('ol', null, voci))),
      h('div', { class: 'editor-corpo' }, barra, stato.modello.bloccato ? null : avvisoModello(), schede)));
    aggiornaStatoEditor(piano);
  }

  function aggiornaStatoEditor(piano) {
    const av = M.avanzamento(piano, stato.modello);
    const box = document.getElementById('avanzamento-editor');
    if (box) box.replaceChildren(h('p', { class: 'avanzamento-testo' }, `${av.fatte} di ${av.totale} sezioni compilate`), barraAvanzamento(av));
    M.sezioniAttive(stato.modello).forEach((s) => {
      const ok = M.sezioneCompleta(piano, s);
      const sel = CSS.escape(s.id);
      document.querySelectorAll(`[data-stato-indice="${sel}"]`).forEach((el) => el.classList.toggle('completa', ok));
      document.querySelectorAll(`[data-stato="${sel}"]`).forEach((el) => {
        el.classList.toggle('completa', ok);
        el.textContent = ok ? '✓ Compilata' : (s.facoltativa ? 'Facoltativa' : 'Da compilare');
      });
    });
    const t = document.getElementById('titolo-piano');
    if (t) t.textContent = M.titoloPiano(piano);
  }

  function modificato(piano) {
    piano.modificato = new Date().toISOString();
    programmaSalvataggio();
    aggiornaStatoEditor(piano);
  }

  function schedaSezione(piano, s, numero) {
    return h('section', { class: 'card sezione', id: 'sez-' + s.id, 'aria-labelledby': 'tit-' + s.id },
      h('header', { class: 'card-testa' },
        h('h2', { id: 'tit-' + s.id }, (numero ? numero + '. ' : '') + s.titolo),
        h('span', { class: 'badge-stato', 'data-stato': s.id })),
      s.guida ? h('p', { class: 'guida' }, s.guida) : null,
      corpoSezione(piano, s));
  }

  function corpoSezione(piano, s) {
    switch (s.tipo) {
      case 'dati': return editorDati(piano);
      case 'situazione': return editorSituazione(piano, s);
      case 'checklist': return editorChecklist(piano, s);
      case 'traguardi': return editorChecklist(piano, s);
      case 'argomenti': return editorArgomenti(piano, s);
      case 'uda': return editorUda(piano, s);
      case 'testo': {
        const v = M.valoreSezione(piano, s);
        return areaTesto(v.note, (t) => { v.note = t; modificato(piano); }, { rows: 5, 'aria-labelledby': 'tit-' + s.id });
      }
      default: return null;
    }
  }

  function editorDati(piano) {
    const m = stato.modello;
    const testoCampo = (id, attrs = {}) => h('input', Object.assign({
      type: 'text', value: piano[id], oninput: (e) => { piano[id] = e.target.value; modificato(piano); }
    }, attrs));
    const discipline = m.discipline.map((d) => d.nome);
    if (piano.disciplina && !discipline.includes(piano.disciplina)) discipline.push(piano.disciplina);
    return h('div', { class: 'griglia-4' },
      campo('Docente', testoCampo('docente', { autocomplete: 'name' }), 'campo largo-2'),
      campo('Disciplina', selezione([{ valore: '', testo: '— scegli —' }].concat(discipline.map((d) => ({ valore: d, testo: d }))),
        piano.disciplina, (v) => {
          const prima = M.trovaDisciplina(m, piano.disciplina);
          const dopo = M.trovaDisciplina(m, v);
          piano.disciplina = v;
          if (dopo && dopo.ore !== '' && (!piano.ore || (prima && String(prima.ore) === piano.ore))) piano.ore = String(dopo.ore);
          modificato(piano);
          // Traguardi, argomenti e nuclei tematici dipendono dalla disciplina.
          render({ mantieniScroll: true });
        }), 'campo largo-2'),
      campo('Classe', selezione([{ valore: '', testo: '—' }].concat(Object.keys(NOMI_CLASSI).map((k) => ({ valore: k, testo: NOMI_CLASSI[k] }))),
        // Gli argomenti proposti dipendono dalla classe.
        piano.classe, (v) => { piano.classe = v; modificato(piano); render({ mantieniScroll: true }); })),
      campo('Sezione', testoCampo('sezione', { maxlength: 6 })),
      campo('Anno scolastico', testoCampo('anno')),
      campo('Ore settimanali', h('input', { type: 'number', min: 0, max: 40, value: piano.ore, oninput: (e) => { piano.ore = e.target.value; modificato(piano); } })),
      campo('Libro di testo', testoCampo('libro'), 'campo largo-2'),
      campo('Plesso / sede (facoltativo)', testoCampo('plesso'), 'campo largo-2'));
  }

  function numero(valore, oninput, attrs = {}) {
    return h('input', Object.assign({ type: 'number', min: 0, max: 60, inputmode: 'numeric', value: valore == null ? '' : valore, oninput: (e) => oninput(e.target.value) }, attrs));
  }

  function editorSituazione(piano, s) {
    const v = M.valoreSezione(piano, s);
    const avvisi = h('div', { class: 'avvisi-form', 'aria-live': 'polite' });
    const aggiornaAvvisi = () => avvisi.replaceChildren(...M.avvisiSituazione(v, stato.modello.livelli).map((a) => h('p', null, '⚠ ' + a)));
    const cambia = () => { aggiornaAvvisi(); modificato(piano); };
    aggiornaAvvisi();
    return [
      h('h3', null, 'Composizione della classe'),
      h('div', { class: 'griglia-numeri' }, M.CAMPI_SITUAZIONE.map((c) => campo(c.etichetta, numero(v.num[c.id], (x) => { v.num[c.id] = x; cambia(); })))),
      h('h3', null, 'Fasce di livello (numero di alunni)'),
      h('div', { class: 'griglia-numeri' }, stato.modello.livelli.map((l) => campo(l, numero(v.livelli[l], (x) => { v.livelli[l] = x; cambia(); })))),
      avvisi,
      h('h3', null, 'Strumenti di rilevazione'),
      listaVoci(piano, v, s.opzioni),
      h('h3', null, 'Osservazioni sulla classe'),
      areaTesto(v.note, (t) => { v.note = t; modificato(piano); }, {
        rows: 4, 'aria-label': 'Osservazioni sulla classe',
        placeholder: 'Partecipazione, interesse, comportamento, clima relazionale, metodo di studio…'
      })
    ];
  }

  function alterna(elenco, voce, attiva) {
    const i = elenco.indexOf(voce);
    if (attiva && i < 0) elenco.push(voce);
    if (!attiva && i >= 0) elenco.splice(i, 1);
  }

  // Elenco di caselle di spunta + voci aggiuntive scritte a mano.
  function listaVoci(piano, v, opzioni, { lunga = false, vuoto = '' } = {}) {
    const box = h('div', { class: 'checklist' + (lunga ? ' lunga' : '') });
    const disegna = () => {
      const extra = v.sel.filter((x) => !opzioni.includes(x));
      box.replaceChildren();
      if (!opzioni.length && !extra.length && vuoto) box.append(h('p', { class: 'nota' }, vuoto));
      opzioni.concat(extra).forEach((voce) => {
        const eExtra = extra.includes(voce);
        box.append(h('label', { class: 'voce' + (eExtra ? ' extra' : ''), title: eExtra ? 'Voce non più presente nel modello d\'istituto' : null },
          h('input', {
            type: 'checkbox', checked: v.sel.includes(voce),
            onchange: (e) => { alterna(v.sel, voce, e.target.checked); if (eExtra) disegna(); modificato(piano); }
          }),
          h('span', null, voce)));
      });
    };
    disegna();
    const comandi = opzioni.length > 2 ? h('div', { class: 'comandi-lista' },
      bottone('Seleziona tutto', () => { opzioni.forEach((o) => alterna(v.sel, o, true)); disegna(); modificato(piano); }, 'btn-link'),
      bottone('Deseleziona tutto', () => { v.sel.length = 0; disegna(); modificato(piano); }, 'btn-link')) : null;
    return [
      comandi, box,
      campo('Altre voci (una per riga)', areaTesto(v.altro, (t) => { v.altro = t; modificato(piano); }, { rows: 2 }), 'campo altro')
    ];
  }

  function editorChecklist(piano, s) {
    const v = M.valoreSezione(piano, s);
    const traguardi = s.tipo === 'traguardi';
    const opzioni = M.opzioniSezione(s, piano, stato.modello);
    const vuoto = traguardi
      ? (piano.disciplina
        ? 'Il modello d\'istituto non contiene traguardi per questa disciplina: aggiungili qui sotto oppure chiedi al referente di inserirli nel modello.'
        : 'Scegli prima la disciplina nei dati generali: qui compariranno i traguardi corrispondenti.')
      : 'Nessuna voce predefinita: aggiungile qui sotto.';
    return [
      listaVoci(piano, v, opzioni, { lunga: traguardi || opzioni.some((o) => o.length > 70), vuoto }),
      s.campi && s.campi.length ? h('div', { class: 'griglia-campi' }, s.campi.map((c) => campo(c.etichetta,
        c.tipo === 'numero'
          ? numero(v.campi[c.id], (x) => { v.campi[c.id] = x; modificato(piano); })
          : h('input', { type: 'text', value: v.campi[c.id] || '', oninput: (e) => { v.campi[c.id] = e.target.value; modificato(piano); } })))) : null,
      traguardi ? null : campo('Note e specificazioni', areaTesto(v.note, (t) => { v.note = t; modificato(piano); }, { rows: 2 }))
    ];
  }

  function salvaBanca() {
    if (!S.salvaBanca(stato.banca)) toast('Impossibile salvare la banca degli argomenti nel browser.', 'errore');
  }

  // Testi delle banche, per catalogo.
  const TESTI_BANCA = {
    argomenti: {
      plurale: 'argomenti', voce: 'Argomento', vuoto: 'Argomenti', gruppo: 'Altri argomenti', conGruppi: true,
      domanda: 'Svolgi un argomento che non c\'è?', esempio: 'es. Canti della tradizione del territorio', esempioGruppo: 'es. Musica e territorio',
      note: 'es. L\'ordine e l\'approfondimento degli argomenti potranno variare in base alle esigenze della classe.'
    },
    obiettivi: {
      plurale: 'obiettivi', voce: 'Obiettivo', vuoto: 'Obiettivi', gruppo: 'Altri obiettivi', conGruppi: true,
      domanda: 'Manca un obiettivo?', esempio: 'es. Riconoscere la struttura di un brano', esempioGruppo: 'es. Musica e cittadinanza',
      note: ''
    },
    obiettiviMinimi: {
      plurale: 'obiettivi minimi', voce: 'Obiettivo minimo', vuoto: 'Obiettivi minimi', gruppo: '', conGruppi: false,
      domanda: 'Manca un obiettivo minimo?', esempio: 'es. Eseguire un semplice ritmo con la body percussion', esempioGruppo: '',
      note: 'es. Per gli alunni con PEI o PDP si fa riferimento agli obiettivi indicati nei rispettivi documenti.'
    }
  };

  const maiuscola = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  // Banca della disciplina (argomenti, obiettivi o obiettivi minimi): è il
  // docente a scegliere le voci. Quelle della sua classe sono in evidenza,
  // quelle delle altre classi in riquadri apribili. Le voci che mancano si
  // aggiungono alla banca personale del docente e vengono riproposte in
  // tutti i suoi piani.
  function editorArgomenti(piano, s) {
    const v = M.valoreSezione(piano, s);
    const cat = M.catalogoSezione(s);
    const T = TESTI_BANCA[cat];
    const box = h('div', { class: 'argomenti' });
    const nomeClasse = (c) => NOMI_CLASSI[c].toLowerCase();
    const gruppiBanca = () => M.gruppiArgomenti(stato.modello, piano, stato.banca, cat);
    const NUOVO_GRUPPO = '\u0000nuovo';
    let doppie = new Set();
    // Riquadri delle altre classi aperti: all'inizio quelli con voci già scelte.
    const aperte = new Set(gruppiBanca()
      .filter((g) => !g.propria && g.voci.some((x) => v.sel.includes(x))).map((g) => g.classe));

    const cambia = (voci, attiva, ridisegna) => {
      voci.forEach((x) => alterna(v.sel, x, attiva));
      if (ridisegna) disegna();
      modificato(piano);
    };

    const togliDallaBanca = (g, voce) => {
      if (!confirm(`Togliere «${voce}» dalla tua banca di ${T.plurale}? Non ti verrà più proposto nei piani di ${piano.disciplina}.`)) return;
      M.rimuoviDaBanca(stato.banca, cat, piano.disciplina, g.classe, voce);
      salvaBanca();
      cambia([voce], false, true);
    };

    const gruppo = (g, etichetta) => {
      const extra = !!g.extra;
      const mie = new Set(g.personali || []);
      const titolo = g.titolo || T.vuoto;
      const lista = h('div', { class: 'checklist' + (cat === 'argomenti' ? '' : ' lunga') }, g.voci.map((voce) => {
        const mia = mie.has(voce);
        const casella = h('label', {
          class: 'voce' + (extra ? ' extra' : '') + (mia ? ' mia' : ''),
          title: extra ? 'Voce non più presente nella banca' : (mia ? 'Aggiunta da te' : null)
        },
        h('input', { type: 'checkbox', checked: v.sel.includes(voce), onchange: (e) => cambia([voce], e.target.checked, extra || doppie.has(voce)) }),
        h('span', null, voce));
        return mia ? h('span', { class: 'voce-mia' }, casella,
          bottone('×', () => togliDallaBanca(g, voce), 'btn-togli', { 'aria-label': `Togli «${voce}» dalla tua banca`, title: 'Togli dalla tua banca' })) : casella;
      }));
      return h('div', { class: 'gruppo-argomenti' },
        h('div', { class: 'gruppo-testa' },
          // Un gruppo senza titolo (es. obiettivi minimi) non ripete il titolo della sezione.
          g.titolo || etichetta ? h('h3', null, titolo, etichetta ? h('span', { class: 'etichetta-classe' }, etichetta) : null) : null,
          extra || g.voci.length < 2 ? null : h('div', { class: 'comandi-lista' },
            bottone('Tutti', () => cambia(g.voci, true, true), 'btn-link', { 'aria-label': 'Seleziona tutto: ' + titolo }),
            bottone('Nessuno', () => cambia(g.voci, false, true), 'btn-link', { 'aria-label': 'Deseleziona tutto: ' + titolo }))),
        lista);
    };

    // Aggiunta di una voce alla banca personale.
    const invio = (e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungiVoce(); } };
    const inputVoce = h('input', { type: 'text', placeholder: T.esempio, onkeydown: invio });
    const inputGruppo = h('input', { type: 'text', placeholder: T.esempioGruppo, onkeydown: invio });
    const campoGruppoNuovo = campo('Nome del nuovo gruppo', inputGruppo);
    const selGruppo = h('select', { onchange: () => campoGruppoNuovo.classList.toggle('nascosto', selGruppo.value !== NUOVO_GRUPPO) });

    function aggiornaGruppiForm(propri, preferito) {
      if (!T.conGruppi) { campoGruppoNuovo.classList.add('nascosto'); return; }
      const scelto = preferito || selGruppo.value || T.gruppo;
      const titoli = [...new Set(propri.map((g) => g.titolo).filter(Boolean))];
      if (!titoli.some((t) => t.toLowerCase() === T.gruppo.toLowerCase())) titoli.push(T.gruppo);
      selGruppo.replaceChildren(...titoli.map((t) => h('option', { value: t }, t)), h('option', { value: NUOVO_GRUPPO }, 'Nuovo gruppo…'));
      if ([...selGruppo.options].some((o) => o.value === scelto)) selGruppo.value = scelto;
      campoGruppoNuovo.classList.toggle('nascosto', selGruppo.value !== NUOVO_GRUPPO);
    }

    function aggiungiVoce() {
      const voce = inputVoce.value.trim();
      if (!voce) { inputVoce.focus(); return; }
      if (!piano.disciplina || !piano.classe) { toast('Indica prima disciplina e classe nei dati generali.', 'errore'); return; }
      const titolo = !T.conGruppi ? '' : (selGruppo.value === NUOVO_GRUPPO ? inputGruppo.value.trim() : selGruppo.value);
      if (T.conGruppi && !titolo) { toast('Scrivi il nome del nuovo gruppo.', 'errore'); inputGruppo.focus(); return; }
      const giaPresente = gruppiBanca().some((g) => g.propria && g.voci.includes(voce));
      if (!giaPresente) {
        M.aggiungiABanca(stato.banca, cat, piano.disciplina, piano.classe, titolo, voce);
        salvaBanca();
      }
      alterna(v.sel, voce, true);
      inputVoce.value = '';
      inputGruppo.value = '';
      disegna(titolo);
      modificato(piano);
      toast(giaPresente ? `«${voce}» era già nella banca: l'ho spuntato.` : `«${voce}» aggiunto alla tua banca di ${piano.disciplina} (classe ${nomeClasse(piano.classe)}).`);
      inputVoce.focus();
    }

    function disegna(gruppoPreferito) {
      const gruppi = gruppiBanca();
      const conteggio = new Map();
      gruppi.forEach((g) => g.voci.forEach((x) => conteggio.set(x, (conteggio.get(x) || 0) + 1)));
      doppie = new Set([...conteggio].filter(([, n]) => n > 1).map(([x]) => x));
      const extra = v.sel.filter((x) => !conteggio.has(x));
      const propri = gruppi.filter((g) => g.propria);
      box.replaceChildren();
      if (!piano.disciplina) {
        box.append(h('p', { class: 'nota' }, 'Scegli prima la disciplina nei dati generali: qui comparirà la banca della disciplina.'));
      } else if (!propri.length) {
        box.append(h('p', { class: 'nota' }, `La banca non contiene ancora ${T.plurale} di ${piano.disciplina} per questa classe: aggiungi qui sotto i tuoi.`));
      }
      propri.forEach((g) => box.append(gruppo(g, piano.classe ? '' : 'classe ' + nomeClasse(g.classe))));
      M.CLASSI.filter((c) => gruppi.some((g) => !g.propria && g.classe === c)).forEach((c) => {
        const gs = gruppi.filter((g) => !g.propria && g.classe === c);
        const voci = new Set(gs.flatMap((g) => g.voci));
        const scelti = [...voci].filter((x) => v.sel.includes(x)).length;
        const riquadro = h('details', { class: 'altra-classe', open: aperte.has(c) },
          h('summary', null, `${maiuscola(T.plurale)} della classe ${nomeClasse(c)} (${voci.size})` + (scelti ? ` · ${scelti} scelti` : '')),
          gs.map((g) => gruppo(g, '')));
        riquadro.addEventListener('toggle', () => { if (riquadro.open) aperte.add(c); else aperte.delete(c); });
        box.append(riquadro);
      });
      if (extra.length) box.append(gruppo({ titolo: 'Voci non più presenti nella banca', voci: extra, extra: true }, ''));
      aggiornaGruppiForm(propri, gruppoPreferito);
    }
    disegna();

    return [
      box,
      piano.disciplina ? h('div', { class: 'aggiungi-argomento' },
        h('h3', null, T.domanda),
        h('p', { class: 'nota' }, 'Scrivilo qui: viene spuntato in questo piano e salvato nella tua banca personale, così lo ritrovi in tutti i tuoi piani di questa disciplina e classe.'),
        h('div', { class: 'riga-aggiungi' },
          campo(T.voce, inputVoce, 'campo largo'),
          T.conGruppi ? campo('Gruppo', selGruppo) : null,
          campoGruppoNuovo,
          bottone('Aggiungi', aggiungiVoce, 'btn primario'))) : null,
      // Voci scritte a mano con una versione precedente dell'app.
      String(v.altro || '').trim() ? campo('Voci scritte a mano (una per riga)', areaTesto(v.altro, (t) => { v.altro = t; modificato(piano); }, { rows: 2 }), 'campo altro') : null,
      campo('Note e specificazioni', areaTesto(v.note, (t) => { v.note = t; modificato(piano); }, { rows: 2, placeholder: T.note }))
    ];
  }

  function editorUda(piano, s) {
    const v = M.valoreSezione(piano, s);
    const disc = M.trovaDisciplina(stato.modello, piano.disciplina);
    const nucleiDisc = disc ? disc.nuclei : [];
    const lista = h('div', { class: 'uda-lista' });
    const periodi = h('datalist', { id: 'periodi-uda' }, stato.modello.periodi.concat(M.MESI).map((p) => h('option', { value: p })));

    const disegna = () => {
      lista.replaceChildren(...v.unita.map(schedaUnita));
      if (!v.unita.length) lista.append(h('p', { class: 'nota' }, 'Nessuna unità inserita. Aggiungine una o copiale da un altro piano.'));
      adattaTutte(lista);
    };

    const sposta = (i, d) => {
      const [u] = v.unita.splice(i, 1);
      v.unita.splice(i + d, 0, u);
      disegna();
      modificato(piano);
    };

    function schedaUnita(u, i) {
      if (!Array.isArray(u.nuclei)) u.nuclei = [];
      const nuclei = nucleiDisc.concat(u.nuclei.filter((x) => !nucleiDisc.includes(x)));
      const cambia = (k) => (x) => { u[k] = x; modificato(piano); };
      return h('div', { class: 'uda' },
        h('div', { class: 'uda-testa' },
          h('strong', null, 'Unità ' + (i + 1)),
          h('div', { class: 'azioni' },
            bottone('↑', () => sposta(i, -1), 'btn piccolo', { disabled: i === 0, 'aria-label': 'Sposta su', title: 'Sposta su' }),
            bottone('↓', () => sposta(i, 1), 'btn piccolo', { disabled: i === v.unita.length - 1, 'aria-label': 'Sposta giù', title: 'Sposta giù' }),
            bottone('Duplica', () => { v.unita.splice(i + 1, 0, M.clona(u)); disegna(); modificato(piano); }, 'btn piccolo'),
            bottone('Elimina', () => {
              const piena = ['titolo', 'obiettivi', 'contenuti'].some((k) => String(u[k] || '').trim());
              if (piena && !confirm(`Eliminare l'unità ${i + 1}${u.titolo ? ' «' + u.titolo + '»' : ''}?`)) return;
              v.unita.splice(i, 1); disegna(); modificato(piano);
            }, 'btn piccolo pericolo'))),
        h('div', { class: 'griglia-uda' },
          campo('Titolo', h('input', { type: 'text', value: u.titolo, oninput: (e) => cambia('titolo')(e.target.value), 'data-titolo-uda': '' }), 'campo largo'),
          campo('Periodo', h('input', { type: 'text', list: 'periodi-uda', value: u.periodo, oninput: (e) => cambia('periodo')(e.target.value), placeholder: 'es. Settembre-Ottobre' })),
          campo('Ore', numero(u.ore, cambia('ore'), { max: 200 }))),
        nuclei.length ? h('fieldset', { class: 'nuclei' }, h('legend', null, 'Nuclei tematici'),
          nuclei.map((n) => h('label', { class: 'voce piccola' },
            h('input', { type: 'checkbox', checked: u.nuclei.includes(n), onchange: (e) => { alterna(u.nuclei, n, e.target.checked); modificato(piano); } }),
            h('span', null, n)))) : null,
        h('div', { class: 'griglia-2' },
          campo('Obiettivi di apprendimento', areaTesto(u.obiettivi, cambia('obiettivi'), { rows: 4, placeholder: 'Un obiettivo per riga' })),
          campo('Contenuti e attività', areaTesto(u.contenuti, cambia('contenuti'), { rows: 4, placeholder: 'Argomenti, attività, compiti di realtà…' }))));
    }

    const conUnita = stato.piani.filter((p) => p.id !== piano.id && p.valori && p.valori[s.id] && Array.isArray(p.valori[s.id].unita) && p.valori[s.id].unita.length);
    const copiaDa = conUnita.length ? selezione(
      [{ valore: '', testo: 'Copia le unità da un altro piano…' }].concat(conUnita.map((p) => ({
        valore: p.id, testo: `${M.titoloPiano(p)} · ${p.anno} (${p.valori[s.id].unita.length} unità)`
      }))), '', (id) => {
        const p = stato.piani.find((x) => x.id === id);
        if (!p) return;
        const copie = M.clona(p.valori[s.id].unita);
        v.unita.push(...copie);
        disegna();
        modificato(piano);
        copiaDa.value = '';
        toast(`Aggiunte ${copie.length} unità da «${M.titoloPiano(p)}».`);
      }, { 'aria-label': 'Copia le unità da un altro piano' }) : null;

    disegna();
    return [
      periodi,
      lista,
      h('div', { class: 'azioni' },
        bottone('+ Aggiungi unità', () => {
          v.unita.push(M.nuovaUnita());
          disegna();
          modificato(piano);
          const titoli = lista.querySelectorAll('[data-titolo-uda]');
          if (titoli.length) titoli[titoli.length - 1].focus();
        }, 'btn primario'),
        copiaDa)
    ];
  }

  /* ================= Anteprima, Word, esportazione ================= */

  function vistaAnteprima(ids) {
    const piani = ids.map((id) => stato.piani.find((p) => p.id === id)).filter(Boolean);
    if (!piani.length) {
      app.append(h('div', { class: 'card' }, h('p', null, 'Nessun piano da mostrare.'), h('a', { href: '#/piani', class: 'btn' }, 'Torna all\'elenco')));
      return;
    }
    const ritorno = piani.length === 1 ? '#/piano/' + encodeURIComponent(piani[0].id) : '#/piani';
    app.append(
      h('div', { class: 'barra-anteprima' },
        h('a', { href: ritorno, class: 'btn' }, piani.length === 1 ? '← Torna alla compilazione' : '← Torna all\'elenco'),
        h('div', { class: 'azioni' },
          bottone('Stampa o salva PDF', () => window.print(), 'btn primario'),
          bottone('Scarica Word', () => scaricaWord(piani))),
        h('p', { class: 'nota' }, 'Per il PDF scegli «Salva come PDF» come stampante nella finestra di stampa.')),
      ...piani.map((p) => h('div', { class: 'foglio', html: D.renderPiano(p, stato.modello, stato.banca) })));
  }

  function scaricaWord(piani) {
    if (!piani.length) return;
    salvaPianiOra();
    const nome = piani.length === 1 ? M.nomeFile(piani[0], 'doc') : `Piani di lavoro (${piani.length}).doc`;
    scarica(nome, '﻿' + D.documentoWord(piani, stato.modello, stato.banca), 'application/msword');
    toast('Documento Word scaricato.');
  }

  function esportaPiani(piani, nome) {
    salvaPianiOra();
    scarica(nome, JSON.stringify(M.pacchettoPiani(piani, M.bancaPerPiani(stato.banca, piani)), null, 2), 'application/json');
    toast(piani.length === 1 ? 'Piano esportato.' : `${piani.length} piani esportati.`);
  }

  async function importaFile() {
    const contenuto = await chiediFile('.json,application/json');
    const r = M.leggiPacchetto(contenuto);
    if (r.errore) { toast(r.errore, 'errore'); return; }
    if (r.tipo === 'modello') {
      if (accessoAttivo() && stato.scuola && !eReferente()) {
        toast(`Usi il modello di ${stato.scuola.nome}, gestito dal referente: non può essere sostituito.`, 'errore');
        return;
      }
      const domanda = stato.modello.bloccato
        ? 'Stai già usando il modello della scuola. Sostituirlo con quello contenuto nel file? Fallo solo se è il modello ufficiale ricevuto dal referente. I piani già compilati non vengono modificati.'
        : 'Il file contiene un modello d\'istituto. Sostituire il modello attuale? I piani già compilati non vengono modificati.';
      if (!confirm(domanda)) return;
      stato.modello = r.modello;
      salvaModelloOra();
      toast('Modello d\'istituto importato.');
      render();
    } else {
      const { piani, stat } = M.unisciPiani(stato.piani, r.piani);
      stato.piani = piani;
      salvaPianiOra();
      if (Object.keys(r.banca).length) { M.unisciBanca(stato.banca, r.banca); salvaBanca(); }
      toast(`Importazione completata: ${stat.aggiunti} nuovi, ${stat.aggiornati} aggiornati` + (stat.ignorati ? `, ${stat.ignorati} già presenti.` : '.'));
      vai('#/piani');
    }
  }

  /* ================= Modello d'istituto ================= */

  function vistaModello() {
    const m = stato.modello;
    app.append(intestazioneVista('Modello d\'istituto',
      'La struttura comune a tutti i piani di lavoro della scuola. Il referente lo configura una volta, lo esporta e lo distribuisce ai colleghi.'));

    if (m.bloccato) {
      app.append(h('div', { class: 'banner-info' },
        h('p', null, h('strong', null, 'Modello della scuola. '), 'È in sola lettura: tutti i docenti devono usarlo così com\'è, perché i piani della scuola abbiano la stessa struttura. ',
          accessoAttivo() && !eReferente() ? 'Possono modificarlo solo i referenti, accedendo con il proprio account della scuola.' : 'Solo il referente può modificarlo.'),
        puoModificareModello() && bottone('Sono il referente: modifica', () => {
          if (!confirm('Il modello della scuola va modificato solo dal referente. Se lo modifichi, i tuoi piani non saranno più uniformi a quelli dei colleghi e potresti non ricevere gli aggiornamenti della scuola. Continuare?')) return;
          m.bloccato = false;
          salvaModelloOra();
          render();
        })));
    }

    app.append(
      h('fieldset', { class: 'modello', disabled: m.bloccato },
        h('legend', { class: 'sr' }, 'Impostazioni del modello'),
        schedaScuola(m), schedaSezioniModello(m), schedaDiscipline(m)),
      puoModificareModello() ? schedaCondivisione(m) : null);
  }

  function schedaScuola(m) {
    const t = (k, etichetta, attrs = {}) => campo(etichetta, h('input', Object.assign({
      type: 'text', value: m.scuola[k], oninput: (e) => { m.scuola[k] = e.target.value; modelloModificato(); }
    }, attrs)));
    const elenco = (k, etichetta) => campo(etichetta, areaTesto(m[k].join('\n'), (x) => { m[k] = M.righe(x); modelloModificato(); }, { rows: 3 }));
    return h('section', { class: 'card' },
      h('h2', null, 'Intestazione e impostazioni generali'),
      h('div', { class: 'griglia-2' },
        t('nome', 'Nome della scuola', { placeholder: 'es. Istituto Comprensivo «G. Rodari»' }),
        t('sottotitolo', 'Sottotitolo', { placeholder: 'es. Scuola secondaria di primo grado' }),
        t('citta', 'Città (per luogo e data)'),
        t('annoScolastico', 'Anno scolastico proposto per i nuovi piani'),
        t('titoloDocumento', 'Titolo del documento', { placeholder: 'es. Piano di lavoro annuale' })),
      h('div', { class: 'griglia-2' },
        elenco('periodi', 'Periodi didattici (uno per riga)'),
        elenco('livelli', 'Fasce di livello (una per riga)')));
  }

  function schedaSezioniModello(m) {
    const lista = h('div', { class: 'lista-sezioni' });

    const disegna = () => {
      lista.replaceChildren(...m.sezioni.map(rigaSezione));
      adattaTutte(lista);
    };
    const cambia = () => modelloModificato();
    const sposta = (i, d) => {
      const [s] = m.sezioni.splice(i, 1);
      m.sezioni.splice(i + d, 0, s);
      cambia();
      disegna();
    };

    function rigaSezione(s, i) {
      const fissa = s.tipo === 'dati';
      const riga = h('div', { class: 'riga-sezione' + (s.attiva ? '' : ' disattiva') });
      const dettagli = [];
      dettagli.push(campo('Indicazioni per i docenti (compaiono sotto il titolo)', areaTesto(s.guida, (x) => { s.guida = x; cambia(); }, { rows: 2 })));
      if (s.tipo === 'checklist' || s.tipo === 'situazione') {
        dettagli.push(campo(s.tipo === 'situazione' ? 'Strumenti di rilevazione proposti (uno per riga)' : 'Voci proposte (una per riga)',
          areaTesto(s.opzioni.join('\n'), (x) => { s.opzioni = M.righe(x); cambia(); }, { rows: 6 })));
      }
      if (s.tipo === 'checklist' || s.tipo === 'situazione' || s.tipo === 'testo' || s.tipo === 'argomenti') {
        dettagli.push(campo('Testo già inserito nei nuovi piani (modificabile dal docente)', areaTesto(s.testo, (x) => { s.testo = x; cambia(); }, { rows: 2 })));
      }
      const notaDiscipline = {
        traguardi: 'I traguardi dipendono dalla disciplina: si modificano più sotto, nella sezione «Discipline».',
        argomenti: 'Le voci della banca dipendono dalla disciplina e dalla classe: si modificano più sotto, nella sezione «Discipline».',
        uda: 'I nuclei tematici proposti dipendono dalla disciplina: si modificano più sotto, nella sezione «Discipline».'
      }[s.tipo];
      if (notaDiscipline) dettagli.push(h('p', { class: 'nota' }, notaDiscipline));
      dettagli.push(h('label', { class: 'voce piccola' },
        h('input', { type: 'checkbox', checked: s.facoltativa, onchange: (e) => { s.facoltativa = e.target.checked; cambia(); } }),
        h('span', null, 'Facoltativa (non conta nel completamento del piano)')));

      aggiungi(riga, [
        h('div', { class: 'riga-testa' },
          h('input', {
            type: 'checkbox', checked: s.attiva, disabled: fissa, 'aria-label': 'Includi la sezione nel piano',
            title: fissa ? 'Sezione sempre presente' : 'Includi nel piano',
            onchange: (e) => { s.attiva = e.target.checked; riga.classList.toggle('disattiva', !s.attiva); cambia(); }
          }),
          h('input', { type: 'text', class: 'titolo-sezione', value: s.titolo, 'aria-label': 'Titolo della sezione', oninput: (e) => { s.titolo = e.target.value; cambia(); } }),
          h('span', { class: 'tipo' }, ETICHETTE_TIPO[s.tipo]),
          h('div', { class: 'azioni' },
            bottone('↑', () => sposta(i, -1), 'btn piccolo', { disabled: i <= 1, 'aria-label': 'Sposta su' }),
            bottone('↓', () => sposta(i, 1), 'btn piccolo', { disabled: fissa || i === m.sezioni.length - 1, 'aria-label': 'Sposta giù' }),
            s.personalizzata ? bottone('Elimina', () => {
              if (!confirm(`Eliminare la sezione «${s.titolo}» dal modello?`)) return;
              m.sezioni.splice(i, 1); cambia(); disegna();
            }, 'btn piccolo pericolo') : null)),
        fissa ? null : h('details', null, h('summary', null, 'Personalizza'), h('div', { class: 'dettagli' }, dettagli))
      ]);
      return riga;
    }

    const nuova = (tipo) => {
      m.sezioni.push({
        id: 'extra-' + M.uid(), tipo, titolo: tipo === 'testo' ? 'Nuova sezione di testo' : 'Nuova sezione',
        attiva: true, facoltativa: false, personalizzata: true, guida: '', opzioni: [], campi: [], testo: ''
      });
      cambia();
      disegna();
      const titoli = lista.querySelectorAll('.titolo-sezione');
      titoli[titoli.length - 1].select();
    };

    disegna();
    return h('section', { class: 'card' },
      h('h2', null, 'Sezioni del piano'),
      h('p', { class: 'nota' }, 'Scegli quali sezioni includere, in che ordine e con quali voci. Le modifiche valgono anche per i piani già creati.'),
      lista,
      h('div', { class: 'azioni' },
        bottone('+ Sezione con elenco di voci', () => nuova('checklist')),
        bottone('+ Sezione di testo libero', () => nuova('testo'))));
  }

  const TITOLI_BANCHE = {
    obiettivi: 'Banca degli obiettivi specifici, per classe',
    obiettiviMinimi: 'Banca degli obiettivi minimi, per classe',
    argomenti: 'Banca degli argomenti, per classe'
  };

  function schedaDiscipline(m) {
    const lista = h('div', { class: 'lista-discipline' });

    const rinomina = (d, input) => {
      const nuovo = input.value.trim();
      const vecchio = d.nome;
      if (nuovo === vecchio) return;
      if (!nuovo || m.discipline.some((x) => x !== d && x.nome.toLowerCase() === nuovo.toLowerCase())) {
        toast(nuovo ? 'Esiste già una disciplina con questo nome.' : 'Il nome non può essere vuoto.', 'errore');
        input.value = vecchio;
        return;
      }
      d.nome = nuovo;
      // La banca personale segue il nuovo nome della disciplina.
      M.CATALOGHI.forEach((cat) => {
        const parte = stato.banca[cat] || {};
        if (!parte[vecchio]) return;
        M.unisciBanca(stato.banca, { [cat]: { [nuovo]: parte[vecchio] } });
        delete parte[vecchio];
        salvaBanca();
      });
      const coinvolti = stato.piani.filter((p) => p.disciplina === vecchio);
      coinvolti.forEach((p) => { p.disciplina = nuovo; });
      if (coinvolti.length) { salvaPianiOra(); toast(`Aggiornati ${coinvolti.length} piani con il nuovo nome.`); }
      modelloModificato();
      disegna();
    };

    function schedaDisciplina(d, i) {
      const usata = stato.piani.filter((p) => p.disciplina === d.nome).length;
      const conta = (cat) => {
        if (!d[cat]) d[cat] = { 1: [], 2: [], 3: [] };
        return M.CLASSI.reduce((n, c) => n + (d[cat][c] || []).reduce((k, g) => k + g.voci.length, 0), 0);
      };
      const nArgomenti = conta('argomenti');
      const nObiettivi = conta('obiettivi') + conta('obiettiviMinimi');
      return h('details', { class: 'disciplina' },
        h('summary', null, h('strong', null, d.nome), h('span', { class: 'nota' }, ` ${d.traguardi.length} traguardi · ${nObiettivi} obiettivi · ${nArgomenti} argomenti · ${d.nuclei.length} nuclei tematici` + (usata ? ` · usata in ${usata} piani` : ''))),
        h('div', { class: 'dettagli' },
          h('div', { class: 'griglia-2' },
            campo('Nome', h('input', { type: 'text', value: d.nome, onchange: (e) => rinomina(d, e.target) })),
            campo('Ore settimanali proposte', h('input', { type: 'number', min: 0, max: 40, value: d.ore, oninput: (e) => { d.ore = e.target.value === '' ? '' : Number(e.target.value); modelloModificato(); } }))),
          campo('Nuclei tematici (uno per riga)', areaTesto(d.nuclei.join('\n'), (x) => { d.nuclei = M.righe(x); modelloModificato(); }, { rows: 4 })),
          campo('Traguardi per lo sviluppo delle competenze (uno per riga)', areaTesto(d.traguardi.join('\n'), (x) => { d.traguardi = M.righe(x); modelloModificato(); }, { rows: 8 })),
          h('p', { class: 'nota' }, 'Le banche sono la base comune: ogni docente sceglie da qui le voci per la propria classe e può aggiungerne di sue nella banca personale. Una voce per riga. Le righe che finiscono con i due punti sono i titoli dei gruppi, ad esempio «Acustica:» seguito dagli argomenti di acustica.'),
          M.CATALOGHI.map((cat) => [
            h('h3', null, TITOLI_BANCHE[cat]),
            h('div', { class: 'griglia-3' }, M.CLASSI.map((c) => campo('Classe ' + NOMI_CLASSI[c].toLowerCase(),
              areaTesto(M.testoArgomenti(d[cat][c]), (x) => { d[cat][c] = M.leggiArgomenti(x); modelloModificato(); }, { rows: 10 }))))]),
          bottone('Elimina disciplina', () => {
            if (!confirm(`Eliminare «${d.nome}» dal modello?` + (usata ? ` I ${usata} piani che la usano restano, ma senza traguardi proposti.` : ''))) return;
            m.discipline.splice(i, 1); modelloModificato(); disegna();
          }, 'btn piccolo pericolo')));
    }

    const disegna = () => lista.replaceChildren(...m.discipline.map(schedaDisciplina));
    disegna();
    lista.addEventListener('toggle', (e) => adattaTutte(e.target), true);

    return h('section', { class: 'card' },
      h('h2', null, 'Discipline'),
      h('p', { class: 'nota' }, 'Per ogni disciplina: traguardi (dalle Indicazioni nazionali 2012), argomenti per classe e nuclei tematici proposti ai docenti. Rinominando una disciplina si aggiornano anche i piani salvati in questo browser.'),
      lista,
      h('div', { class: 'azioni' }, bottone('+ Aggiungi disciplina', () => {
        let n = 1;
        while (m.discipline.some((d) => d.nome === 'Nuova disciplina ' + n)) n++;
        m.discipline.push({ nome: 'Nuova disciplina ' + n, ore: '', nuclei: [], traguardi: [], argomenti: { 1: [], 2: [], 3: [] }, obiettivi: { 1: [], 2: [], 3: [] }, obiettiviMinimi: { 1: [], 2: [], 3: [] } });
        modelloModificato();
        disegna();
        const ultimo = lista.lastElementChild;
        ultimo.open = true;
        ultimo.querySelector('input').select();
      })));
  }

  function schedaCondivisione(m) {
    const blocca = h('input', { type: 'checkbox', checked: true });
    return h('section', { class: 'card' },
      h('h2', null, 'Distribuzione ai docenti'),
      h('ol', { class: 'passi' },
        h('li', null, 'Esporta il modello e invia il file ai colleghi (e-mail, registro elettronico, cartella condivisa).'),
        h('li', null, 'Ogni docente apre l\'app e usa «Importa file»: da quel momento tutti compilano la stessa struttura.'),
        h('li', null, 'Per pubblicarlo sul sito, così che i docenti lo ricevano accedendo con l\'account della scuola, invia il file a chi gestisce il sito: va salvato nella cartella ', h('code', null, 'scuole'), '. I docenti riceveranno in automatico anche gli aggiornamenti.')),
      h('label', { class: 'voce piccola' }, blocca, h('span', null, 'Distribuisci in sola lettura (i docenti non lo modificano per errore)')),
      h('div', { class: 'azioni' },
        bottone('Esporta il modello', () => {
          const copia = M.clona(m);
          copia.bloccato = blocca.checked;
          copia.aggiornato = m.aggiornato || new Date().toISOString();
          scarica('modello-istituto.json', JSON.stringify(M.pacchettoModello(copia), null, 2), 'application/json');
          toast('Modello esportato.');
        }, 'btn primario'),
        bottone('Importa un modello', importaFile),
        bottone('Ripristina il modello predefinito', () => {
          if (!confirm('Ripristinare sezioni, voci e discipline predefinite? I dati della scuola vengono mantenuti. Se sei un docente non farlo: i piani vanno compilati con il modello della scuola.')) return;
          const nuovo = M.normalizzaModello(null);
          nuovo.scuola = m.scuola;
          nuovo.aggiornato = new Date().toISOString();
          stato.modello = nuovo;
          salvaModelloOra();
          render();
          toast('Modello predefinito ripristinato.');
        }, 'btn pericolo')));
  }

  /* ================= Guida ================= */

  function vistaGuida() {
    const blocco = (titolo, ...contenuto) => h('section', { class: 'card guida-testo' }, h('h2', null, titolo), contenuto);
    app.append(
      intestazioneVista('Guida rapida', 'Come usare l\'app in pochi minuti.'),
      blocco('Per il referente o il dirigente',
        h('ol', null,
          h('li', null, 'Apri «Modello d\'istituto» e inserisci il nome della scuola e la città.'),
          h('li', null, 'Scegli le sezioni da includere, il loro ordine e le voci proposte (metodologie, strumenti, verifiche…).'),
          h('li', null, 'Controlla le discipline: traguardi, argomenti per classe e nuclei tematici sono già inseriti e si possono adattare al curricolo d\'istituto.'),
          h('li', null, 'Premi «Esporta il modello» e distribuisci il file ai docenti.'))),
      blocco('Per i docenti',
        h('ol', null,
          h('li', null, h('strong', null, 'Usa sempre il modello della scuola. '), 'Premi «Accedi con Google» in alto e usa l\'account della scuola: il modello viene caricato in automatico. Senza accesso puoi aprire l\'app dal link della scuola oppure, in alternativa, premi «Importa file» e scegli il modello ricevuto dal referente. Non modificarlo e non sostituirlo: così tutti i piani della scuola hanno la stessa struttura. Quando compare l\'avviso di aggiornamento, premi «Aggiorna».'),
          h('li', null, 'Premi «+ Nuovo piano», indica disciplina, classe e sezione. Scrivendo «A, B, C» crei tre piani insieme.'),
          h('li', null, 'Compila le sezioni: quasi tutto si fa spuntando le voci. L\'indice a sinistra mostra cosa manca.'),
          h('li', null, 'Premi «Anteprima e stampa» per il PDF, oppure «Scarica Word» per il file modificabile.'))),
      blocco('Per fare prima',
        h('ul', null,
          h('li', null, h('strong', null, 'Riparti dall\'anno scorso: '), 'crea il nuovo piano scegliendo «Copia i contenuti da un piano esistente». Viene azzerata solo la situazione di partenza.'),
          h('li', null, h('strong', null, 'Stessa disciplina in più classi: '), 'compila un piano, poi «Duplica» e indica le altre sezioni.'),
          h('li', null, h('strong', null, 'Argomenti: '), 'spunta dalla banca della disciplina quelli che svolgi; se ne svolgi altri, aggiungili con «Svolgi un argomento che non c\'è?». Restano nella tua banca personale e li ritrovi nei piani successivi.'),
          h('li', null, h('strong', null, 'Unità di apprendimento: '), 'usa «Copia le unità da un altro piano» per riprendere la programmazione di un collega o di un altro anno.'),
          h('li', null, h('strong', null, 'Consiglio di classe: '), 'importa i piani dei colleghi, filtra per classe, selezionali e stampali o scaricali in un unico documento.'))),
      blocco('Dove sono salvati i dati',
        h('p', null, 'I piani sono salvati automaticamente ', h('strong', null, 'solo in questo browser, su questo computer'), '. Nessun dato viene inviato a server esterni.'),
        h('ul', null,
          h('li', null, 'Fai periodicamente «Backup di tutti i piani» dall\'elenco e conserva il file.'),
          h('li', null, 'Per passare a un altro computer esporta i piani e importali lì con «Importa file».'),
          h('li', null, 'Anche la tua banca personale di argomenti è salvata nel browser ed è inclusa nei backup e nei file esportati.'),
          h('li', null, 'Cancellare i dati di navigazione del browser elimina anche i piani non esportati.'))),
      blocco('Riferimenti',
        h('ul', null,
          h('li', null, 'Indicazioni nazionali per il curricolo della scuola dell\'infanzia e del primo ciclo d\'istruzione (D.M. 254/2012) e Indicazioni nazionali e nuovi scenari (2018).'),
          h('li', null, 'Raccomandazione del Consiglio dell\'Unione europea del 22 maggio 2018 sulle competenze chiave per l\'apprendimento permanente.'),
          h('li', null, 'D.Lgs. 62/2017 sulla valutazione; L. 104/1992, L. 170/2010 e normativa sui BES per l\'inclusione.'),
          h('li', null, 'L. 92/2019 e Linee guida per l\'insegnamento dell\'educazione civica (D.M. 183/2024).')),
        h('p', { class: 'nota' }, 'I testi dei traguardi sono riportati dalle Indicazioni nazionali, in alcuni casi in forma sintetica: il referente può adattarli nel modello d\'istituto.')));
  }

  /* ================= Accesso con Google ================= */

  function accessoAttivo() {
    return !!C.googleClientId && location.protocol !== 'file:';
  }

  function eReferente() {
    return M.eReferente(stato.scuola, stato.utente);
  }

  // Con l'accesso attivo, il modello della scuola lo modifica solo il referente.
  function puoModificareModello() {
    return !accessoAttivo() || !stato.modello.bloccato || eReferente();
  }

  function caricaGoogle() {
    if (!accessoAttivo()) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      google.accounts.id.initialize({ client_id: C.googleClientId, callback: (r) => accedi(r.credential), ux_mode: 'popup' });
      disegnaAccesso();
    };
    script.onerror = () => toast('Impossibile caricare l\'accesso con Google: controlla la connessione.', 'errore');
    document.head.append(script);
  }

  function disegnaAccesso() {
    const box = document.getElementById('accesso');
    if (!box || !accessoAttivo()) return;
    if (stato.utente) {
      box.replaceChildren(
        h('span', { class: 'utente', title: stato.utente.email },
          stato.utente.nome || stato.utente.email,
          eReferente() ? h('span', { class: 'badge-referente' }, 'referente') : null),
        bottone('Esci', esci, 'btn-link'));
      return;
    }
    const area = h('div', { class: 'bottone-google' });
    box.replaceChildren(area);
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.renderButton(area, { theme: 'outline', size: 'medium', shape: 'pill', text: 'signin_with', locale: 'it' });
    }
  }

  function accedi(token) {
    const u = M.leggiTokenGoogle(token);
    if (!u) { toast('Accesso non riuscito.', 'errore'); return; }
    stato.utente = u;
    S.salvaUtente(u);
    stato.scuola = M.trovaScuola(C.scuole, u);
    if (!S.preferenze().docente && u.nome) S.salvaPreferenza('docente', u.nome);
    disegnaAccesso();
    if (stato.scuola) {
      toast(`Accesso eseguito: ${stato.scuola.nome}.`);
      caricaModelloScuola();
    } else {
      toast(u.dominio
        ? 'Accesso eseguito. La tua scuola non ha ancora un modello su questo sito: usa il modello ricevuto dal referente.'
        : 'Hai usato un account personale: per ricevere il modello della scuola accedi con l\'account della scuola.');
    }
    render({ mantieniScroll: true });
  }

  function esci() {
    stato.utente = null;
    stato.scuola = null;
    S.salvaUtente(null);
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    disegnaAccesso();
    render({ mantieniScroll: true });
    toast('Disconnessione eseguita.');
  }

  // Il modello della scuola vale per tutti i docenti e viene applicato da
  // solo; solo il referente può tenere modifiche non ancora pubblicate.
  function caricaModelloScuola() {
    S.caricaModelloIstituto(stato.scuola.modello).then((remoto) => {
      if (!remoto || !stato.scuola) return;
      const locale = stato.modello;
      if (stato.modelloSalvato && locale.bloccato && locale.aggiornato === remoto.aggiornato) return;
      if (eReferente() && stato.modelloSalvato && !locale.bloccato) {
        if (remoto.aggiornato > (locale.aggiornato || '')) mostraAggiornamentoModello(remoto);
        return;
      }
      stato.modello = remoto;
      salvaModelloOra();
      render({ mantieniScroll: true });
      toast(`Modello di ${stato.scuola.nome} caricato.`);
    });
  }

  /* ================= Avvio ================= */

  function mostraAggiornamentoModello(remoto) {
    const banner = document.getElementById('banner');
    banner.replaceChildren(h('div', { class: 'banner-info' },
      h('p', null, h('strong', null, 'È disponibile un aggiornamento del modello della scuola. '), 'Applicalo subito: i piani vanno compilati con il modello in vigore. I piani già compilati non vengono modificati.'),
      h('div', { class: 'azioni' },
        bottone('Aggiorna', () => {
          stato.modello = remoto;
          salvaModelloOra();
          banner.replaceChildren();
          render({ mantieniScroll: true });
          toast('Modello d\'istituto aggiornato.');
        }, 'btn primario'),
        bottone('Più tardi', () => banner.replaceChildren()))));
  }

  function avvia() {
    const salvato = S.caricaModello();
    stato.modello = salvato || M.normalizzaModello(null);
    stato.modelloSalvato = !!salvato;
    stato.piani = S.caricaPiani();
    stato.banca = S.caricaBanca();

    document.getElementById('btn-importa').addEventListener('click', importaFile);
    const stile = document.createElement('style');
    stile.textContent = D.CSS_DOCUMENTO;
    document.head.append(stile);

    stato.utente = accessoAttivo() ? S.caricaUtente() : null;
    stato.scuola = M.trovaScuola(C.scuole, stato.utente);

    window.addEventListener('hashchange', () => render());
    aggiornaTestata();
    render();
    caricaGoogle();
    disegnaAccesso();

    if (stato.scuola) { caricaModelloScuola(); return; }
    S.caricaModelloIstituto(C.modelloPubblico).then((remoto) => {
      if (!remoto) return;
      if (!stato.modelloSalvato) {
        stato.modello = remoto;
        salvaModelloOra();
        render({ mantieniScroll: true });
      } else if (remoto.aggiornato && remoto.aggiornato > (stato.modello.aggiornato || '')) {
        mostraAggiornamentoModello(remoto);
      }
    });
  }

  avvia();
})();
