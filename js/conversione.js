/*
 * Conversione di un piano di lavoro scritto con un altro formato (Word, PDF…)
 * nella struttura del modello d'istituto. Riceve le righe di testo già lette
 * dal file (js/lettura.js) e restituisce i dati del piano, le voci riconosciute
 * per ogni sezione e il testo che non è stato possibile collocare.
 * Nessuna dipendenza dal DOM: il file è usato sia dal browser sia dai test.
 */
(function (root) {
  'use strict';

  var model = root.PDL && root.PDL.model;
  if (!model && typeof require === 'function') model = require('./model.js');

  /* ---------- Confronto tra testi ---------- */

  var PAROLE_VUOTE = ('il lo la i gli le l un uno una un di a da in con su per tra fra e ed o od che del dello della dei degli delle ' +
    'al allo alla ai agli alle dal dallo dalla dai dagli dalle nel nello nella nei negli nelle sul sullo sulla sui sugli sulle ' +
    'col coi non anche come si sia sono essere ad').split(' ');
  var VUOTE = {};
  PAROLE_VUOTE.forEach(function (p) { VUOTE[p] = true; });

  function normalizza(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Radice grossolana per l'italiano: "verifica", "verifiche" → "verific".
  function radice(p) {
    return p.length > 4 ? p.replace(/[aeiouh]+$/, '') : p;
  }

  function gettoni(s) {
    var visti = {};
    normalizza(s).split(' ').forEach(function (p) {
      if (p.length > 1 && !VUOTE[p]) visti[radice(p)] = true;
    });
    return Object.keys(visti);
  }

  // Coefficiente di Dice tra due insiemi di parole (0 = diversi, 1 = uguali).
  function somiglianzaGettoni(a, b) {
    if (!a.length || !b.length) return 0;
    var inB = {};
    b.forEach(function (x) { inB[x] = true; });
    var comuni = a.filter(function (x) { return inB[x]; }).length;
    return 2 * comuni / (a.length + b.length);
  }

  function somiglianza(a, b) {
    return somiglianzaGettoni(gettoni(a), gettoni(b));
  }

  /* ---------- Pulizia delle righe ---------- */

  var SEGNI_ELENCO = /^[\s•·▪●◦■□☐☑☒✓✔‣⁃➢►▶\-–—*>+]+/;
  var NUMERAZIONE = /^(\d{1,2}|[a-z])[.)]\s+/i;

  // Righe: [{ testo, titolo, spuntata }]. Le caselle non spuntate vengono scartate.
  function pulisciRighe(righe) {
    var out = [];
    (righe || []).forEach(function (r) {
      var oggetto = typeof r === 'string' ? { testo: r } : r;
      if (!oggetto || oggetto.spuntata === false) return;
      String(oggetto.testo == null ? '' : oggetto.testo).split(/\r?\n/).forEach(function (parte) {
        var t = parte.replace(/[ \t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
        t = t.replace(SEGNI_ELENCO, '').replace(NUMERAZIONE, '').trim();
        if (t.length < 2 || /^\d+$/.test(t)) return;
        out.push({ testo: t, titolo: !!oggetto.titolo });
      });
    });
    return out;
  }

  /* ---------- Titoli delle sezioni ---------- */

  // Modi diversi di chiamare le stesse sezioni nei piani di lavoro.
  var SINONIMI = {
    situazione: ['caratteristiche della classe', 'situazione di partenza', 'situazione iniziale', 'analisi della situazione',
      'presentazione della classe', 'composizione della classe', 'fasce di livello', 'livelli di partenza'],
    profilo: ['la classe e', 'profilo della classe', 'comportamento della classe'],
    ritmo: ['ritmo di apprendimento'],
    competenze: ['competenze chiave', 'competenze europee', 'competenze di cittadinanza'],
    traguardi: ['traguardi', 'traguardi per lo sviluppo delle competenze', 'descrittori competenze', 'descrittori di competenza'],
    obiettivi: ['obiettivi specifici', 'obiettivi di apprendimento', 'obiettivi disciplinari', 'conoscenze e abilita',
      'obiettivi conoscenze e abilita', 'obiettivi formativi'],
    obiettiviMinimi: ['obiettivi minimi', 'livelli minimi', 'standard minimi', 'saperi minimi', 'contenuti minimi'],
    argomenti: ['contenuti', 'contenuti disciplinari', 'argomenti', 'programma', 'programma svolto', 'programma didattico',
      'programmazione dei contenuti', 'argomenti disciplinari'],
    uda: ['unita di apprendimento', 'uda'],
    metodologie: ['metodi', 'metodologie', 'metodologia', 'metodologie didattiche', 'strategie didattiche', 'metodi e strategie'],
    strumenti: ['strumenti', 'mezzi e strumenti', 'sussidi', 'materiali didattici', 'strumenti e sussidi'],
    attivita: ['attivita in classe', 'attivita a casa', 'attivita in classe e a casa'],
    verifiche: ['verifiche', 'verifica', 'modalita di verifica', 'tipologia delle verifiche', 'strumenti di verifica'],
    valutazione: ['criteri di valutazione', 'valutazione'],
    recupero: ['recupero', 'attivita di recupero', 'recupero e potenziamento', 'potenziamento', 'consolidamento'],
    inclusione: ['inclusione', 'casi particolari', 'alunni con bisogni educativi speciali', 'bes', 'alunni bes'],
    edcivica: ['educazione civica'],
    famiglie: ['rapporti con le famiglie', 'rapporti scuola famiglia'],
    note: ['osservazioni', 'note']
  };

  function sinonimiSezione(s) {
    var chiave = s.tipo === 'argomenti' ? model.catalogoSezione(s) : s.id;
    return (SINONIMI[chiave] || SINONIMI[s.id] || []).map(normalizza);
  }

  // Un titolo di sezione è corto: al massimo otto parole.
  function sembraTitolo(riga) {
    var parole = riga.testo.split(/\s+/).length;
    if (parole > 8) return false;
    if (riga.titolo) return true;
    var lettere = riga.testo.replace(/[^A-Za-zÀ-ÿ]/g, '');
    return /:$/.test(riga.testo) || (lettere.length >= 3 && riga.testo === riga.testo.toUpperCase());
  }

  // Sezione del modello indicata da un titolo, o null. Il titolo della sezione
  // conta più dei sinonimi; un sinonimo vale solo se occupa buona parte del
  // titolo ("Verifiche orali" dentro i criteri di valutazione non è un nuovo capitolo).
  function valutaTitolo(titolo, sezioni) {
    var n = normalizza(titolo.replace(/:$/, ''));
    if (!n) return { sezione: null, punti: 0 };
    var gt = gettoni(n);
    var migliore = null;
    var punti = 0;
    sezioni.forEach(function (s) {
      if (s.tipo === 'dati') return;
      var nt = normalizza(s.titolo);
      var p = 0;
      if (nt === n) p = 3;
      else if (n.length >= 6 && (nt.indexOf(n) === 0 || (n.indexOf(nt + ' ') === 0 && gettoni(nt).length >= 2))) p = 2;
      else {
        sinonimiSezione(s).forEach(function (sin) {
          var parteIniziale = n === sin || n.indexOf(sin + ' ') === 0;
          var copertura = gettoni(sin).length / Math.max(1, gt.length);
          if ((parteIniziale && copertura > 0.5) || (parteIniziale && copertura >= 0.3 && gt.length >= 4) || somiglianzaGettoni(gt, gettoni(sin)) >= 0.85) {
            p = Math.max(p, 1 + Math.min(9, gettoni(sin).length) / 10 + sin.length / 1000);
          }
        });
      }
      if (p > punti) { punti = p; migliore = s; }
    });
    return { sezione: migliore, punti: punti };
  }

  function trovaSezione(titolo, sezioni) {
    return valutaTitolo(titolo, sezioni).sezione;
  }

  /* ---------- Dati del piano ---------- */

  var ALTRI_NOMI_DISCIPLINE = {
    'Lingua inglese': ['inglese'],
    'Seconda lingua comunitaria': ['francese', 'spagnolo', 'tedesco', 'seconda lingua'],
    'Arte e immagine': ['arte'],
    'Educazione fisica': ['scienze motorie', 'educazione motoria'],
    'Religione cattolica': ['religione', 'irc'],
    'Scienze': ['scienze matematiche', 'scienze naturali']
  };

  var NUMERI_CLASSE = { prima: '1', seconda: '2', terza: '3', i: '1', ii: '2', iii: '3', '1': '1', '2': '2', '3': '3' };

  function trovaDisciplina(testo, modello) {
    var n = ' ' + normalizza(testo) + ' ';
    var nomi = [];
    modello.discipline.forEach(function (d) {
      nomi.push([d.nome, normalizza(d.nome)]);
      (ALTRI_NOMI_DISCIPLINE[d.nome] || []).forEach(function (a) { nomi.push([d.nome, normalizza(a)]); });
    });
    // Prima i nomi più lunghi ("scienze motorie" prima di "scienze").
    nomi.sort(function (a, b) { return b[1].length - a[1].length; });
    for (var i = 0; i < nomi.length; i++) {
      if (n.indexOf(' ' + nomi[i][1] + ' ') >= 0) return nomi[i][0];
    }
    return '';
  }

  // Docente, disciplina, classe, sezione e anno scolastico, dalle prime righe.
  function estraiDati(righe, modello) {
    var dati = { docente: '', disciplina: '', classe: '', sezione: '', anno: '' };
    var prime = righe.slice(0, 40);
    var tutto = prime.map(function (r) { return r.testo; }).join('\n');

    var anno = tutto.match(/\b(20\d\d)\s*[\/\-–]\s*(20)?(\d\d)\b/);
    if (anno) dati.anno = anno[1] + '/' + (anno[2] ? anno[2] + anno[3] : '20' + anno[3]);

    var classe = tutto.match(/class[ei]\s*:?\s*(prima|seconda|terza|iii|ii|i|[123])\s*[°ªa^]?\s*(?:sez(?:ione|\.)?\s*:?\s*)?([A-Za-z])?\b/i);
    if (classe) {
      dati.classe = NUMERI_CLASSE[classe[1].toLowerCase()] || '';
      if (classe[2]) dati.sezione = classe[2].toUpperCase();
    }
    if (!dati.sezione) {
      var sezione = tutto.match(/sez(?:ione|\.)\s*:?\s*([A-Za-z])\b/i);
      if (sezione) dati.sezione = sezione[1].toUpperCase();
    }

    var etichetta = tutto.match(/(?:disciplina|materia|insegnamento)\s*:?\s*([^\n]+)/i);
    dati.disciplina = (etichetta && trovaDisciplina(etichetta[1], modello)) || '';
    for (var i = 0; !dati.disciplina && i < prime.length; i++) {
      if (prime[i].testo.split(/\s+/).length <= 6) dati.disciplina = trovaDisciplina(prime[i].testo, modello);
    }

    // Nome e cognome sulla stessa riga dell'indicazione del ruolo.
    var nome = '([A-ZÀ-Ý][a-zà-ÿ\'’]+(?:[ \\t]+[A-ZÀ-Ý][a-zà-ÿ\'’]+){1,3})';
    var ruolo = '(?:[Pp]rof\\.?(?:ssa)?|[Pp]rofessor(?:essa|e)?|[Dd]ocente|[Ii]nsegnante)[ \\t]*:?[ \\t]*';
    var docente = tutto.match(new RegExp(ruolo + nome));
    if (!docente) {
      var fine = righe.slice(-15).map(function (r) { return r.testo; }).join('\n');
      docente = fine.match(new RegExp(ruolo + nome));
    }
    if (docente) dati.docente = docente[1];
    return dati;
  }

  /* ---------- Conversione ---------- */

  var LIVELLI_ALTERNATIVI = [
    ['avanzat', 0], ['intermedi', 1], ['base', 2], ['iniziale', 3], ['prima acquisizione', 3]
  ];

  // Voci tra cui cercare, per ogni sezione del modello.
  function vociDelModello(modello, piano, banca) {
    var elenco = [];
    var titoliGruppi = [];
    model.sezioniAttive(modello).forEach(function (s) {
      var aggiungi = function (voce, extra) {
        elenco.push(Object.assign({ sezione: s, voce: voce, gettoni: gettoni(voce) }, extra || {}));
      };
      if (s.tipo === 'checklist' || s.tipo === 'situazione') s.opzioni.forEach(function (o) { aggiungi(o); });
      if (s.tipo === 'traguardi') model.opzioniSezione(s, piano, modello).forEach(function (o) { aggiungi(o); });
      if (s.tipo === 'argomenti') {
        model.gruppiArgomenti(modello, piano, banca, model.catalogoSezione(s)).forEach(function (g) {
          if (g.titolo) titoliGruppi.push({ sezione: s, titolo: g.titolo, gettoni: gettoni(g.titolo) });
          g.voci.forEach(function (v) { aggiungi(v, { propria: g.propria }); });
        });
      }
    });
    return { voci: elenco, gruppi: titoliGruppi };
  }

  function confronta(riga, contesto, indice, corrente) {
    var g1 = gettoni(riga);
    var g2 = contesto ? gettoni(contesto + ' ' + riga) : null;
    var migliore = null;
    var miglioreQui = null;
    indice.voci.forEach(function (c) {
      var p = somiglianzaGettoni(g1, c.gettoni);
      if (g2) p = Math.max(p, somiglianzaGettoni(g2, c.gettoni));
      if (c.propria === false) p -= 0.02;
      var voce = { c: c, p: p };
      // A parità di punteggio vince la sezione in cui ci si trova.
      if (!migliore || p > migliore.p + 0.02 || (Math.abs(p - migliore.p) <= 0.02 && corrente && c.sezione === corrente)) migliore = voce;
      if (corrente && c.sezione === corrente && (!miglioreQui || p > miglioreQui.p)) miglioreQui = voce;
    });
    if (migliore && migliore.p >= 0.8) return migliore.c;
    if (miglioreQui && miglioreQui.p >= 0.6) return miglioreQui.c;
    return null;
  }

  function titoloGruppo(riga, indice, sezione) {
    var g = gettoni(riga);
    var trovato = null;
    indice.gruppi.forEach(function (x) {
      if ((!sezione || x.sezione === sezione) && somiglianzaGettoni(g, x.gettoni) >= 0.8 && !trovato) trovato = x;
    });
    return trovato;
  }

  function maiuscolaIniziale(t) {
    var s = t.replace(/:$/, '').trim();
    if (s === s.toUpperCase()) s = s.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Aggiunge un paragrafo alle note di una sezione, se non c'è già.
  function aggiungiNota(v, testo) {
    var esistenti = String(v.note || '').split(/\n\s*\n/);
    if (esistenti.some(function (e) { return somiglianza(e, testo) >= 0.8; })) return false;
    v.note = (String(v.note || '').trim() ? String(v.note).trim() + '\n\n' : '') + testo;
    return true;
  }

  // Gruppo della banca personale per le voci aggiunte senza un sottotitolo.
  var GRUPPO_ALTRI = { argomenti: 'Altri argomenti', obiettivi: 'Altri obiettivi', obiettiviMinimi: '' };

  // Luogo e data, firma, numeri di pagina: non sono contenuti del piano.
  function eDiServizio(t) {
    return /^[A-Za-zÀ-ÿ'’ ]{2,40},?\s+(li\s+)?\d{1,2}\s*[\/.\-]\s*\d{1,2}\s*[\/.\-]\s*\d{2,4}$/.test(t) ||
      /^(luogo e )?data\b/i.test(t) ||
      /^(firma|il\/la docente|l[ae'’]\s*insegnante|il docente|la docente)\b/i.test(t) ||
      /^pag(ina|\.)?\s*\d+(\s*(di|\/)\s*\d+)?$/i.test(t);
  }

  function eProsa(t) {
    return t.length > 110 || (t.length > 60 && /[.;]$/.test(t));
  }

  /*
   * opzioni: { dati: dati scelti dal docente (prevalgono su quelli letti),
   *            banca: banca personale, inBanca: aggiungi alla banca personale
   *            le voci di argomenti e obiettivi che mancano }
   * Restituisce { dati, piano, riepilogo, aggiunteBanca, nonCollocati, intestazione }.
   */
  function converti(righeLette, modello, opzioni) {
    opzioni = opzioni || {};
    var righe = pulisciRighe(righeLette);
    var letti = estraiDati(righe, modello);
    var dati = Object.assign({}, letti);
    Object.keys(opzioni.dati || {}).forEach(function (k) { if (opzioni.dati[k] != null && opzioni.dati[k] !== '') dati[k] = opzioni.dati[k]; });
    var piano = model.nuovoPiano(modello, dati);
    var banca = model.normalizzaBanca(opzioni.banca);
    var indice = vociDelModello(modello, piano, banca);
    var sezioni = model.sezioniAttive(modello);

    var riepilogo = {};
    var conta = function (s, campo) {
      var r = riepilogo[s.id] || (riepilogo[s.id] = { id: s.id, titolo: s.titolo, riconosciute: 0, aggiunte: 0, testo: 0 });
      r[campo]++;
    };
    var aggiunteBanca = [];
    var nonCollocati = [];
    var intestazione = [];
    var corrente = null;
    var contesto = '';
    var trovataSezione = false;

    // Una riga breve senza punteggiatura può essere un'etichetta ("Verifica
    // formativa") o una voce vera ("Lavagna"): lo si capisce dalla riga dopo.
    var inSospeso = null;
    var sciogliSospeso = function (eraVoce) {
      if (inSospeso && eraVoce) colloca(inSospeso.testo, inSospeso.sezione, inSospeso.contesto);
      inSospeso = null;
    };

    var spunta = function (s, voce) {
      var v = model.valoreSezione(piano, s);
      if (v.sel.indexOf(voce) >= 0) return;
      v.sel.push(voce);
      conta(s, 'riconosciute');
    };

    righe.forEach(function (riga) {
      var t = riga.testo;
      var parole = t.split(/\s+/).length;
      if (eDiServizio(t)) return;

      // Numero di alunni, ovunque si trovi.
      var alunni = t.match(/(?:numero\s+(?:di\s+|degli\s+)?)?(?:alunni|allievi|studenti)\s*(?:iscritti)?\s*[:=]?\s*(\d{1,2})\b/i);
      var sit = sezioni.find(function (s) { return s.tipo === 'situazione'; });
      if (alunni && sit && t.length < 60) {
        model.valoreSezione(piano, sit).num.alunni = alunni[1];
        conta(sit, 'riconosciute');
        return;
      }

      var titolo = valutaTitolo(t, sezioni);
      // Titolo: per l'aspetto (maiuscolo, due punti, stile) oppure perché nomina chiaramente una
      // sezione, come accade nel testo dei file .doc che non conserva la formattazione.
      var nomina = (parole <= 16 && titolo.punti >= 2) ||
        (parole <= 10 && titolo.punti >= 1.2 && !/[.;,]$/.test(t) && !confronta(t, '', indice, null));
      if (sembraTitolo(riga) || nomina) {
        sciogliSospeso(true);
        var s = titolo.sezione;
        // Nei criteri di valutazione i sottotitoli "Verifiche orali", "Verifiche scritte"… non aprono un nuovo capitolo.
        if (s && corrente && corrente.id === 'valutazione' && s.id === 'verifiche' && normalizza(t) !== normalizza(s.titolo)) s = null;
        if (s) {
          corrente = s;
          contesto = '';
          trovataSezione = true;
          return;
        }
        contesto = t.replace(/:$/, '');
        return;
      }

      var c = confronta(t, contesto, indice, corrente);
      if (c) { sciogliSospeso(false); spunta(c.sezione, c.voce); return; }

      var gruppo = titoloGruppo(t, indice, null);
      if (gruppo) { sciogliSospeso(true); contesto = gruppo.titolo; return; }

      if (!trovataSezione) { intestazione.push(t); return; }

      // Frase introduttiva ("Il processo di apprendimento sarà monitorato mediante:").
      if (/:$/.test(t) && parole > 8) { sciogliSospeso(true); nonCollocati.push(t); return; }

      var breve = parole <= 3 && !/[.;]$/.test(t);
      if (breve && corrente && corrente.tipo !== 'argomenti') {
        sciogliSospeso(true);
        inSospeso = { testo: t, sezione: corrente, contesto: contesto };
        contesto = t.replace(/:$/, '');
        return;
      }
      // Dopo un'etichetta vengono delle voci; se segue un paragrafo, la riga breve era una voce.
      sciogliSospeso(eProsa(t));
      colloca(t, corrente, contesto);
    });
    sciogliSospeso(true);

    // Riga non riconosciuta: va nella sezione in cui si trova.
    function colloca(t, corrente, contesto) {
      if (!corrente) { nonCollocati.push(t); return; }
      var v = model.valoreSezione(piano, corrente);
      switch (corrente.tipo) {
        case 'situazione': {
          var livello = null;
          modello.livelli.forEach(function (l, i) {
            if (!livello && normalizza(t).indexOf(normalizza(l).split(' ')[0]) === 0) livello = l;
            LIVELLI_ALTERNATIVI.forEach(function (a) { if (!livello && a[1] === i && normalizza(t).indexOf(a[0]) === 0) livello = l; });
          });
          var numero = t.match(/[:=]\s*(\d{1,2})\s*$/);
          if (livello && numero) { v.livelli[livello] = numero[1]; conta(corrente, 'riconosciute'); return; }
          if (aggiungiNota(v, t)) conta(corrente, 'testo');
          return;
        }
        case 'checklist':
        case 'traguardi':
          if (eProsa(t) && corrente.tipo === 'checklist') { if (aggiungiNota(v, t)) conta(corrente, 'testo'); return; }
          v.altro = (String(v.altro || '').trim() ? String(v.altro).trim() + '\n' : '') + t;
          conta(corrente, 'aggiunte');
          return;
        case 'argomenti': {
          if (eProsa(t) && t.length > 160) { if (aggiungiNota(v, t)) conta(corrente, 'testo'); return; }
          var cat = model.catalogoSezione(corrente);
          if (opzioni.inBanca && piano.disciplina && piano.classe) {
            var esistente = contesto ? titoloGruppo(contesto, indice, corrente) : null;
            var titolo = cat === 'obiettiviMinimi' ? '' : (esistente ? esistente.titolo : (contesto ? maiuscolaIniziale(contesto) : GRUPPO_ALTRI[cat]));
            aggiunteBanca.push({ catalogo: cat, titolo: titolo, voce: t });
            if (v.sel.indexOf(t) < 0) v.sel.push(t);
          } else {
            v.altro = (String(v.altro || '').trim() ? String(v.altro).trim() + '\n' : '') + t;
          }
          conta(corrente, 'aggiunte');
          return;
        }
        case 'testo':
          if (aggiungiNota(v, t)) conta(corrente, 'testo');
          return;
        default:
          nonCollocati.push(t);
      }
    }

    return {
      dati: dati,
      letti: letti,
      piano: piano,
      righe: righe.length,
      riepilogo: sezioni.map(function (s) { return riepilogo[s.id]; }).filter(Boolean),
      aggiunteBanca: aggiunteBanca,
      nonCollocati: nonCollocati,
      intestazione: intestazione
    };
  }

  var api = {
    normalizza: normalizza,
    gettoni: gettoni,
    somiglianza: somiglianza,
    pulisciRighe: pulisciRighe,
    sembraTitolo: sembraTitolo,
    trovaSezione: trovaSezione,
    estraiDati: estraiDati,
    converti: converti
  };

  root.PDL = root.PDL || {};
  root.PDL.conversione = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
