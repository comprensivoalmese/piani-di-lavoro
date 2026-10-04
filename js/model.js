/*
 * Logica dei dati: modello d'istituto, piani di lavoro, completamento.
 * Nessuna dipendenza dal DOM: il file è usato sia dal browser sia dai test.
 */
(function (root) {
  'use strict';

  var defaults = root.PDL && root.PDL.defaults;
  if (!defaults && typeof require === 'function') defaults = require('./defaults.js');

  var FORMATO_MODELLO = 'modello-piano-di-lavoro';
  var FORMATO_PIANI = 'piani-di-lavoro';

  var CAMPI_DATI = [
    { id: 'docente', etichetta: 'Docente', obbligatorio: true },
    { id: 'disciplina', etichetta: 'Disciplina', obbligatorio: true },
    { id: 'classe', etichetta: 'Classe', obbligatorio: true },
    { id: 'sezione', etichetta: 'Sezione', obbligatorio: true },
    { id: 'anno', etichetta: 'Anno scolastico', obbligatorio: true },
    { id: 'ore', etichetta: 'Ore settimanali' },
    { id: 'libro', etichetta: 'Libro di testo' },
    { id: 'plesso', etichetta: 'Plesso / sede' }
  ];

  var CAMPI_SITUAZIONE = [
    { id: 'alunni', etichetta: 'Alunni' },
    { id: 'maschi', etichetta: 'Maschi' },
    { id: 'femmine', etichetta: 'Femmine' },
    { id: 'ripetenti', etichetta: 'Ripetenti' },
    { id: 'h104', etichetta: 'Con disabilità (L. 104/92)' },
    { id: 'dsa', etichetta: 'Con DSA' },
    { id: 'bes', etichetta: 'Altri BES' },
    { id: 'nai', etichetta: 'Non italofoni / NAI' }
  ];

  var MESI = ['Settembre', 'Ottobre', 'Novembre', 'Dicembre', 'Gennaio', 'Febbraio',
    'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Intero anno'];

  function clona(x) { return JSON.parse(JSON.stringify(x)); }

  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function testo(x) { return x == null ? '' : String(x); }

  function righe(s) {
    return testo(s).split(/\r?\n/).map(function (r) { return r.trim(); }).filter(Boolean);
  }

  function isOggetto(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }

  function elencoStringhe(a) {
    return Array.isArray(a) ? a.map(testo).map(function (s) { return s.trim(); }).filter(Boolean) : [];
  }

  /* ---------- Modello ---------- */

  // Completa un modello (anche parziale o di una versione precedente)
  // con i valori predefiniti, così che l'interfaccia possa fidarsi della forma.
  function normalizzaModello(m) {
    var base = defaults.modelloPredefinito();
    if (!isOggetto(m)) return base;
    // I modelli precedenti alla versione 2 non avevano gli argomenti.
    var migra = !(Number(m.schema) >= 2);
    var out = {
      schema: 2,
      aggiornato: testo(m.aggiornato),
      bloccato: !!m.bloccato,
      scuola: Object.assign({}, base.scuola, isOggetto(m.scuola) ? m.scuola : {}),
      periodi: elencoStringhe(m.periodi).length ? elencoStringhe(m.periodi) : base.periodi,
      livelli: elencoStringhe(m.livelli).length ? elencoStringhe(m.livelli) : base.livelli,
      sezioni: [],
      discipline: []
    };

    var visti = {};
    (Array.isArray(m.sezioni) ? m.sezioni : base.sezioni).forEach(function (s) {
      if (!isOggetto(s) || !s.id || visti[s.id]) return;
      if (defaults.TIPI_SEZIONE.indexOf(s.tipo) < 0) return;
      visti[s.id] = true;
      out.sezioni.push(normalizzaSezione(s));
    });
    // La sezione "dati" è sempre presente, attiva e in prima posizione.
    var iDati = out.sezioni.findIndex(function (s) { return s.tipo === 'dati'; });
    var dati = iDati >= 0 ? out.sezioni.splice(iDati, 1)[0] : clona(base.sezioni[0]);
    dati.attiva = true;
    out.sezioni.unshift(dati);

    if (migra && !out.sezioni.some(function (s) { return s.tipo === 'argomenti'; })) {
      var sezArgomenti = clona(base.sezioni.find(function (s) { return s.tipo === 'argomenti'; }));
      if (!visti[sezArgomenti.id]) {
        var iTraguardi = out.sezioni.findIndex(function (s) { return s.tipo === 'traguardi'; });
        var iUda = out.sezioni.findIndex(function (s) { return s.tipo === 'uda'; });
        var dove = iTraguardi >= 0 ? iTraguardi + 1 : (iUda >= 0 ? iUda : out.sezioni.length);
        out.sezioni.splice(dove, 0, normalizzaSezione(sezArgomenti));
      }
    }

    var nomi = {};
    (Array.isArray(m.discipline) ? m.discipline : base.discipline).forEach(function (d) {
      if (!isOggetto(d)) return;
      var nome = testo(d.nome).trim();
      if (!nome || nomi[nome.toLowerCase()]) return;
      nomi[nome.toLowerCase()] = true;
      out.discipline.push({
        nome: nome,
        ore: d.ore === '' || d.ore == null ? '' : Number(d.ore) || '',
        nuclei: elencoStringhe(d.nuclei),
        traguardi: elencoStringhe(d.traguardi),
        argomenti: normalizzaArgomenti(migra && !isOggetto(d.argomenti) ? defaults.argomentiPredefiniti(nome) : d.argomenti)
      });
    });
    return out;
  }

  function normalizzaSezione(s) {
    return {
      id: testo(s.id),
      tipo: s.tipo,
      titolo: testo(s.titolo) || 'Sezione',
      attiva: s.attiva !== false,
      facoltativa: !!s.facoltativa,
      personalizzata: !!s.personalizzata,
      guida: testo(s.guida),
      opzioni: elencoStringhe(s.opzioni),
      campi: Array.isArray(s.campi) ? s.campi.filter(function (c) { return isOggetto(c) && c.id; }).map(function (c) {
        return { id: testo(c.id), etichetta: testo(c.etichetta) || testo(c.id), tipo: c.tipo === 'numero' ? 'numero' : 'testo' };
      }) : [],
      testo: testo(s.testo)
    };
  }

  /* ---------- Argomenti per disciplina e classe ---------- */

  var CLASSI = ['1', '2', '3'];

  // { "1": [{ titolo, voci }], "2": [...], "3": [...] }
  function normalizzaArgomenti(a) {
    var out = {};
    CLASSI.forEach(function (c) {
      var gruppi = isOggetto(a) && Array.isArray(a[c]) ? a[c] : [];
      out[c] = gruppi.filter(isOggetto).map(function (g) {
        return { titolo: testo(g.titolo).trim(), voci: elencoStringhe(g.voci) };
      }).filter(function (g) { return g.voci.length; });
    });
    return out;
  }

  // Testo modificabile dal referente: i titoli dei gruppi finiscono con ":".
  function testoArgomenti(gruppi) {
    return (gruppi || []).map(function (g) {
      return (g.titolo ? [g.titolo + ':'] : []).concat(g.voci).join('\n');
    }).join('\n');
  }

  // Banca personale del docente: argomenti aggiunti a mano, con la stessa
  // forma degli argomenti del modello ({ "Musica": { "1": [{ titolo, voci }] } }).
  // È salvata nel browser del docente e riproposta in tutti i suoi piani.
  function normalizzaBanca(b) {
    var out = {};
    if (!isOggetto(b)) return out;
    Object.keys(b).forEach(function (nome) {
      var n = testo(nome).trim();
      if (!n) return;
      var a = normalizzaArgomenti(b[nome]);
      if (CLASSI.some(function (c) { return a[c].length; })) out[n] = a;
    });
    return out;
  }

  function stessoTitolo(a, b) { return testo(a).trim().toLowerCase() === testo(b).trim().toLowerCase(); }

  function aggiungiABanca(banca, disciplina, classe, titolo, voce) {
    var nome = testo(disciplina).trim();
    var x = testo(voce).trim();
    if (!nome || !x || CLASSI.indexOf(testo(classe)) < 0) return false;
    var a = banca[nome] || (banca[nome] = normalizzaArgomenti(null));
    var g = a[classe].find(function (gr) { return stessoTitolo(gr.titolo, titolo); });
    if (!g) { g = { titolo: testo(titolo).trim(), voci: [] }; a[classe].push(g); }
    if (g.voci.indexOf(x) < 0) g.voci.push(x);
    return true;
  }

  function rimuoviDaBanca(banca, disciplina, classe, voce) {
    var a = banca[disciplina];
    if (!a || !a[classe]) return;
    a[classe] = a[classe].map(function (g) {
      return { titolo: g.titolo, voci: g.voci.filter(function (x) { return x !== voce; }) };
    }).filter(function (g) { return g.voci.length; });
    if (!CLASSI.some(function (c) { return a[c].length; })) delete banca[disciplina];
  }

  // Aggiunge alla banca "a" le voci della banca "b" (importazioni e backup).
  function unisciBanca(a, b) {
    Object.keys(b || {}).forEach(function (nome) {
      CLASSI.forEach(function (c) {
        ((b[nome] || {})[c] || []).forEach(function (g) {
          g.voci.forEach(function (x) { aggiungiABanca(a, nome, c, g.titolo, x); });
        });
      });
    });
    return a;
  }

  // Solo la parte della banca che riguarda le discipline dei piani indicati.
  function bancaPerPiani(banca, piani) {
    var out = {};
    piani.forEach(function (p) { if (banca && banca[p.disciplina]) out[p.disciplina] = clona(banca[p.disciplina]); });
    return out;
  }

  // Gruppi di argomenti della banca per il piano: prima quelli della sua
  // classe, poi quelli delle altre classi (propria = false); senza classe,
  // tutti. Gli argomenti della banca personale si uniscono ai gruppi con lo
  // stesso titolo e sono elencati anche in "personali".
  function gruppiArgomenti(modello, piano, banca) {
    var d = trovaDisciplina(modello, piano.disciplina);
    var mia = banca && banca[testo(piano.disciplina).trim()];
    if (!(d && d.argomenti) && !mia) return [];
    var classe = testo(piano.classe);
    var ordine = CLASSI.indexOf(classe) >= 0
      ? [classe].concat(CLASSI.filter(function (c) { return c !== classe; }))
      : CLASSI;
    var out = [];
    ordine.forEach(function (c) {
      var propria = !classe || c === classe;
      var personali = (mia && mia[c]) || [];
      var uniti = {};
      ((d && d.argomenti && d.argomenti[c]) || []).forEach(function (g) {
        var extra = [];
        personali.forEach(function (m, i) {
          if (!stessoTitolo(m.titolo, g.titolo)) return;
          uniti[i] = true;
          m.voci.forEach(function (x) { if (g.voci.indexOf(x) < 0 && extra.indexOf(x) < 0) extra.push(x); });
        });
        out.push({ classe: c, titolo: g.titolo, voci: g.voci.concat(extra), personali: extra, propria: propria });
      });
      personali.forEach(function (m, i) {
        if (!uniti[i]) out.push({ classe: c, titolo: m.titolo, voci: m.voci.slice(), personali: m.voci.slice(), propria: propria });
      });
    });
    return out;
  }

  // Argomenti scelti, raggruppati come nella banca (gruppi con lo stesso
  // titolo vengono uniti). Le voci non più presenti e quelle scritte a mano
  // nel piano finiscono in "altri".
  function argomentiScelti(piano, sezione, modello, banca) {
    var v = valoreSezione(piano, sezione);
    var scelti = {};
    v.sel.forEach(function (x) { scelti[x] = true; });
    var stampati = {};
    var gruppi = [];
    var perTitolo = {};
    gruppiArgomenti(modello, piano, banca).forEach(function (g) {
      var voci = g.voci.filter(function (x) { return scelti[x] && !stampati[x]; });
      if (!voci.length) return;
      voci.forEach(function (x) { stampati[x] = true; });
      var k = g.titolo.toLowerCase();
      if (k in perTitolo) gruppi[perTitolo[k]].voci = gruppi[perTitolo[k]].voci.concat(voci);
      else { perTitolo[k] = gruppi.length; gruppi.push({ titolo: g.titolo, voci: voci }); }
    });
    var altri = v.sel.filter(function (x) { return !stampati[x]; }).concat(righe(v.altro));
    return { gruppi: gruppi, altri: altri };
  }

  function trovaDisciplina(modello, nome) {
    var n = testo(nome).trim().toLowerCase();
    for (var i = 0; i < modello.discipline.length; i++) {
      if (modello.discipline[i].nome.toLowerCase() === n) return modello.discipline[i];
    }
    return null;
  }

  function sezioniAttive(modello) {
    return modello.sezioni.filter(function (s) { return s.attiva; });
  }

  // Opzioni proposte per una sezione: per i traguardi dipendono dalla disciplina.
  function opzioniSezione(sezione, piano, modello) {
    if (sezione.tipo === 'traguardi') {
      var d = trovaDisciplina(modello, piano.disciplina);
      return d ? d.traguardi : [];
    }
    return sezione.opzioni || [];
  }

  /* ---------- Piani ---------- */

  function valoreVuoto(sezione) {
    switch (sezione.tipo) {
      case 'situazione': return { num: {}, livelli: {}, sel: [], altro: '', note: sezione.testo || '' };
      case 'checklist': return { sel: [], altro: '', note: sezione.testo || '', campi: {} };
      case 'traguardi': return { sel: [], altro: '' };
      case 'argomenti': return { sel: [], altro: '', note: sezione.testo || '' };
      case 'uda': return { unita: [] };
      case 'testo': return { note: sezione.testo || '' };
      default: return {};
    }
  }

  // Restituisce (creandolo se manca) il valore di una sezione nel piano,
  // garantendone la forma attesa.
  function valoreSezione(piano, sezione) {
    piano.valori = isOggetto(piano.valori) ? piano.valori : {};
    var v = piano.valori[sezione.id];
    if (!isOggetto(v)) v = piano.valori[sezione.id] = valoreVuoto(sezione);
    if ('sel' in valoreVuoto(sezione) && !Array.isArray(v.sel)) v.sel = [];
    if (sezione.tipo === 'uda' && !Array.isArray(v.unita)) v.unita = [];
    if (sezione.tipo === 'situazione') {
      if (!isOggetto(v.num)) v.num = {};
      if (!isOggetto(v.livelli)) v.livelli = {};
    }
    if (sezione.tipo === 'checklist' && !isOggetto(v.campi)) v.campi = {};
    return v;
  }

  function nuovaUnita() {
    return { titolo: '', periodo: '', ore: '', nuclei: [], obiettivi: '', contenuti: '' };
  }

  function nuovoPiano(modello, dati) {
    dati = dati || {};
    var disc = trovaDisciplina(modello, dati.disciplina);
    var ora = new Date().toISOString();
    var p = {
      id: uid(),
      creato: ora,
      modificato: ora,
      docente: testo(dati.docente).trim(),
      disciplina: testo(dati.disciplina).trim(),
      classe: testo(dati.classe).trim(),
      sezione: testo(dati.sezione).trim().toUpperCase(),
      anno: testo(dati.anno).trim() || modello.scuola.annoScolastico,
      ore: dati.ore != null && dati.ore !== '' ? testo(dati.ore) : (disc && disc.ore !== '' ? testo(disc.ore) : ''),
      libro: testo(dati.libro).trim(),
      plesso: testo(dati.plesso).trim(),
      valori: {}
    };
    modello.sezioni.forEach(function (s) {
      if (s.tipo !== 'dati') p.valori[s.id] = valoreVuoto(s);
    });
    return p;
  }

  // Crea un nuovo piano copiando i contenuti di uno esistente.
  // La situazione di partenza è specifica della classe e viene azzerata.
  function copiaContenuti(destinazione, sorgente, modello) {
    var valori = clona(sorgente.valori || {});
    modello.sezioni.forEach(function (s) {
      if (s.tipo === 'situazione') valori[s.id] = valoreVuoto(s);
    });
    destinazione.valori = valori;
    if (!destinazione.libro) destinazione.libro = testo(sorgente.libro);
    return destinazione;
  }

  // Se si chiede "A, B, C" si ottiene un piano per ogni sezione.
  function elencoSezioniClasse(s) {
    var parti = testo(s).toUpperCase().split(/[\s,;\/]+/).filter(Boolean);
    var uniche = [];
    parti.forEach(function (x) { if (uniche.indexOf(x) < 0) uniche.push(x); });
    return uniche;
  }

  function titoloPiano(p) {
    var classe = (testo(p.classe) + testo(p.sezione)).trim();
    return [p.disciplina || 'Disciplina non indicata', classe ? 'classe ' + classe : ''].filter(Boolean).join(' – ');
  }

  function nomeFile(p, estensione) {
    var parti = ['Piano di lavoro', p.disciplina, (testo(p.classe) + testo(p.sezione)), testo(p.anno).replace('/', '-')];
    return parti.filter(Boolean).join(' - ').replace(/[\\/:*?"<>|]+/g, '') + '.' + estensione;
  }

  function sezioneCompleta(piano, sezione) {
    if (sezione.tipo === 'dati') {
      return CAMPI_DATI.every(function (c) { return !c.obbligatorio || testo(piano[c.id]).trim(); });
    }
    var v = valoreSezione(piano, sezione);
    switch (sezione.tipo) {
      case 'situazione': return Number(v.num.alunni) > 0;
      case 'checklist':
      case 'traguardi':
      case 'argomenti': return v.sel.length > 0 || righe(v.altro).length > 0;
      case 'uda': return v.unita.some(function (u) { return testo(u.titolo).trim(); });
      case 'testo': return !!testo(v.note).trim();
      default: return true;
    }
  }

  function avanzamento(piano, modello) {
    var conteggiate = sezioniAttive(modello).filter(function (s) { return !s.facoltativa; });
    var fatte = conteggiate.filter(function (s) { return sezioneCompleta(piano, s); }).length;
    return {
      fatte: fatte,
      totale: conteggiate.length,
      percentuale: conteggiate.length ? Math.round(fatte * 100 / conteggiate.length) : 100
    };
  }

  // Controlli di coerenza sulla situazione di partenza (avvisi, non errori).
  function avvisiSituazione(v, livelli) {
    var n = v.num || {};
    var avvisi = [];
    var tot = Number(n.alunni) || 0;
    var m = Number(n.maschi) || 0;
    var f = Number(n.femmine) || 0;
    if (tot && (m || f) && m + f !== tot) {
      avvisi.push('Maschi + femmine (' + (m + f) + ') non corrisponde al numero di alunni (' + tot + ').');
    }
    var sommaLivelli = (livelli || []).reduce(function (acc, l) { return acc + (Number((v.livelli || {})[l]) || 0); }, 0);
    if (tot && sommaLivelli && sommaLivelli !== tot) {
      avvisi.push('La somma delle fasce di livello (' + sommaLivelli + ') non corrisponde al numero di alunni (' + tot + ').');
    }
    return avvisi;
  }

  function normalizzaPiano(p) {
    if (!isOggetto(p)) return null;
    var ora = new Date().toISOString();
    var out = {
      id: testo(p.id) || uid(),
      creato: testo(p.creato) || ora,
      modificato: testo(p.modificato) || ora,
      valori: isOggetto(p.valori) ? p.valori : {}
    };
    CAMPI_DATI.forEach(function (c) { out[c.id] = testo(p[c.id]); });
    return out;
  }

  /* ---------- Import / export ---------- */

  function pacchettoModello(modello) {
    return { formato: FORMATO_MODELLO, versione: 1, modello: modello };
  }

  function pacchettoPiani(piani, banca) {
    var pacchetto = { formato: FORMATO_PIANI, versione: 1, esportato: new Date().toISOString(), piani: piani };
    if (banca && Object.keys(banca).length) pacchetto.banca = banca;
    return pacchetto;
  }

  // Riconosce il contenuto di un file importato.
  function leggiPacchetto(json) {
    var dati;
    try { dati = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) {
      return { errore: 'Il file non è un file JSON valido.' };
    }
    if (!isOggetto(dati)) return { errore: 'Contenuto del file non riconosciuto.' };
    if (dati.formato === FORMATO_MODELLO && isOggetto(dati.modello)) {
      return { tipo: 'modello', modello: normalizzaModello(dati.modello) };
    }
    if (dati.formato === FORMATO_PIANI && Array.isArray(dati.piani)) {
      return { tipo: 'piani', piani: dati.piani.map(normalizzaPiano).filter(Boolean), banca: normalizzaBanca(dati.banca) };
    }
    return { errore: 'Il file non contiene né un modello né dei piani di lavoro.' };
  }

  // Unisce piani importati a quelli esistenti: a parità di id prevale il più recente.
  function unisciPiani(esistenti, importati) {
    var perId = {};
    var risultato = esistenti.slice();
    risultato.forEach(function (p, i) { perId[p.id] = i; });
    var stat = { aggiunti: 0, aggiornati: 0, ignorati: 0 };
    importati.forEach(function (p) {
      if (!(p.id in perId)) {
        perId[p.id] = risultato.length;
        risultato.push(p);
        stat.aggiunti++;
      } else if (p.modificato > risultato[perId[p.id]].modificato) {
        risultato[perId[p.id]] = p;
        stat.aggiornati++;
      } else {
        stat.ignorati++;
      }
    });
    return { piani: risultato, stat: stat };
  }

  var api = {
    CAMPI_DATI: CAMPI_DATI,
    CAMPI_SITUAZIONE: CAMPI_SITUAZIONE,
    MESI: MESI,
    CLASSI: CLASSI,
    clona: clona,
    uid: uid,
    righe: righe,
    normalizzaModello: normalizzaModello,
    trovaDisciplina: trovaDisciplina,
    sezioniAttive: sezioniAttive,
    opzioniSezione: opzioniSezione,
    leggiArgomenti: defaults.leggiArgomenti,
    testoArgomenti: testoArgomenti,
    gruppiArgomenti: gruppiArgomenti,
    normalizzaBanca: normalizzaBanca,
    aggiungiABanca: aggiungiABanca,
    rimuoviDaBanca: rimuoviDaBanca,
    unisciBanca: unisciBanca,
    bancaPerPiani: bancaPerPiani,
    argomentiScelti: argomentiScelti,
    valoreVuoto: valoreVuoto,
    valoreSezione: valoreSezione,
    nuovaUnita: nuovaUnita,
    nuovoPiano: nuovoPiano,
    copiaContenuti: copiaContenuti,
    elencoSezioniClasse: elencoSezioniClasse,
    titoloPiano: titoloPiano,
    nomeFile: nomeFile,
    sezioneCompleta: sezioneCompleta,
    avanzamento: avanzamento,
    avvisiSituazione: avvisiSituazione,
    normalizzaPiano: normalizzaPiano,
    pacchettoModello: pacchettoModello,
    pacchettoPiani: pacchettoPiani,
    leggiPacchetto: leggiPacchetto,
    unisciPiani: unisciPiani
  };

  root.PDL = root.PDL || {};
  root.PDL.model = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
