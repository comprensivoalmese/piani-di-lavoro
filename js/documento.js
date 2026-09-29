/*
 * Generazione del documento finale (anteprima, stampa/PDF, Word).
 * Produce HTML come stringa: tutto il testo inserito dall'utente viene
 * sempre passato da esc().
 */
(function (root) {
  'use strict';

  var model = root.PDL && root.PDL.model;
  if (!model && typeof require === 'function') model = require('./model.js');

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function paragrafi(s) {
    var blocchi = String(s == null ? '' : s).split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
    return blocchi.map(function (b) { return '<p>' + esc(b).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  function multilinea(s) {
    return esc(String(s == null ? '' : s).trim()).replace(/\n/g, '<br>');
  }

  var VUOTO = '<p class="doc-vuoto">Sezione non compilata.</p>';

  // Voci selezionate nell'ordine del modello, seguite da eventuali voci
  // non più presenti nel modello e dalle voci aggiunte a mano ("altro").
  function vociSelezionate(v, opzioni) {
    var sel = v.sel || [];
    var voci = opzioni.filter(function (o) { return sel.indexOf(o) >= 0; });
    sel.forEach(function (s) { if (voci.indexOf(s) < 0) voci.push(s); });
    return voci.concat(model.righe(v.altro));
  }

  function elenco(voci, numerato) {
    if (!voci.length) return '';
    var tag = numerato ? 'ol' : 'ul';
    return '<' + tag + '>' + voci.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</' + tag + '>';
  }

  function sezioneSituazione(piano, sez, modello) {
    var v = model.valoreSezione(piano, sez);
    var n = v.num;
    var html = '';
    var tot = Number(n.alunni) || 0;
    if (tot) {
      var frase = 'La classe è composta da <strong>' + tot + '</strong> alunni';
      if (n.maschi || n.femmine) frase += ' (' + (Number(n.maschi) || 0) + ' maschi, ' + (Number(n.femmine) || 0) + ' femmine)';
      html += '<p>' + frase + '.</p>';
    }
    var altri = model.CAMPI_SITUAZIONE.slice(3).filter(function (c) { return Number(n[c.id]) > 0; });
    if (altri.length) {
      html += '<table class="doc-tab"><tr>' + altri.map(function (c) { return '<th>' + esc(c.etichetta) + '</th>'; }).join('') +
        '</tr><tr>' + altri.map(function (c) { return '<td>' + esc(n[c.id]) + '</td>'; }).join('') + '</tr></table>';
    }
    var livelli = modello.livelli.filter(function (l) { return Number(v.livelli[l]) > 0; });
    if (livelli.length) {
      html += '<p class="doc-sotto">Fasce di livello</p><table class="doc-tab"><tr>' +
        modello.livelli.map(function (l) { return '<th>' + esc(l) + '</th>'; }).join('') + '</tr><tr>' +
        modello.livelli.map(function (l) { return '<td>' + esc(Number(v.livelli[l]) || 0) + '</td>'; }).join('') + '</tr></table>';
    }
    var strumenti = vociSelezionate(v, sez.opzioni);
    if (strumenti.length) html += '<p class="doc-sotto">Strumenti di rilevazione</p>' + elenco(strumenti);
    if (String(v.note || '').trim()) html += '<p class="doc-sotto">Osservazioni sulla classe</p>' + paragrafi(v.note);
    return html || VUOTO;
  }

  function sezioneChecklist(piano, sez, modello) {
    var v = model.valoreSezione(piano, sez);
    var html = elenco(vociSelezionate(v, model.opzioniSezione(sez, piano, modello)), sez.tipo === 'traguardi');
    var campi = (sez.campi || []).filter(function (c) { return String((v.campi || {})[c.id] || '').trim(); });
    if (campi.length) {
      html += '<table class="doc-tab doc-campi">' + campi.map(function (c) {
        return '<tr><th>' + esc(c.etichetta) + '</th><td>' + esc(v.campi[c.id]) + '</td></tr>';
      }).join('') + '</table>';
    }
    if (String(v.note || '').trim()) html += paragrafi(v.note);
    return html || VUOTO;
  }

  function sezioneUda(piano, sez) {
    var unita = model.valoreSezione(piano, sez).unita.filter(function (u) {
      return ['titolo', 'obiettivi', 'contenuti'].some(function (k) { return String(u[k] || '').trim(); });
    });
    if (!unita.length) return VUOTO;
    return '<table class="doc-tab doc-uda"><thead><tr><th style="width:4%">N.</th><th style="width:22%">Unità e tempi</th>' +
      '<th style="width:18%">Nuclei tematici</th><th style="width:28%">Obiettivi di apprendimento</th><th style="width:28%">Contenuti e attività</th></tr></thead><tbody>' +
      unita.map(function (u, i) {
        var tempi = [u.periodo, u.ore ? u.ore + ' ore' : ''].filter(Boolean).join(' · ');
        return '<tr><td>' + (i + 1) + '</td><td><strong>' + multilinea(u.titolo) + '</strong>' +
          (tempi ? '<br><em>' + esc(tempi) + '</em>' : '') + '</td><td>' + esc((u.nuclei || []).join('; ')) +
          '</td><td>' + multilinea(u.obiettivi) + '</td><td>' + multilinea(u.contenuti) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function corpoSezione(piano, sez, modello) {
    switch (sez.tipo) {
      case 'situazione': return sezioneSituazione(piano, sez, modello);
      case 'checklist':
      case 'traguardi': return sezioneChecklist(piano, sez, modello);
      case 'uda': return sezioneUda(piano, sez);
      case 'testo': {
        var t = model.valoreSezione(piano, sez).note;
        return String(t || '').trim() ? paragrafi(t) : VUOTO;
      }
      default: return '';
    }
  }

  function intestazione(piano, modello) {
    var sc = modello.scuola;
    var righeDati = model.CAMPI_DATI.filter(function (c) {
      return ['anno'].indexOf(c.id) < 0 && String(piano[c.id] || '').trim();
    }).map(function (c) {
      var val = c.id === 'classe' ? piano.classe + (piano.sezione ? ' ' + piano.sezione : '') : piano[c.id];
      return c.id === 'sezione' ? '' : '<tr><th>' + esc(c.etichetta) + '</th><td>' + esc(val) + '</td></tr>';
    }).join('');
    return '<header class="doc-testata">' +
      (sc.nome ? '<div class="doc-scuola">' + esc(sc.nome) + '</div>' : '') +
      (sc.sottotitolo ? '<div class="doc-sottotitolo">' + esc(sc.sottotitolo) + '</div>' : '') +
      '<h1 class="doc-titolo">Piano di lavoro annuale</h1>' +
      '<div class="doc-anno">Anno scolastico ' + esc(piano.anno || sc.annoScolastico) + '</div>' +
      '</header><table class="doc-tab doc-dati">' + righeDati + '</table>';
  }

  function firma(piano, modello) {
    var luogo = modello.scuola.citta ? esc(modello.scuola.citta) + ', ' : 'Luogo e data: ';
    return '<div class="doc-firma"><div>' + luogo + '____________________</div>' +
      '<div class="doc-firma-docente">Il/La docente<br><span>' + esc(piano.docente || '') + '</span></div></div>';
  }

  function renderPiano(piano, modello) {
    var n = 0;
    var corpo = model.sezioniAttive(modello).filter(function (s) { return s.tipo !== 'dati'; }).map(function (s) {
      n++;
      return '<section class="doc-sezione"><h2>' + n + '. ' + esc(s.titolo) + '</h2>' + corpoSezione(piano, s, modello) + '</section>';
    }).join('');
    return '<article class="doc">' + intestazione(piano, modello) + corpo + firma(piano, modello) + '</article>';
  }

  // Stili del documento, condivisi da anteprima, stampa e Word.
  var CSS_DOCUMENTO = [
    '.doc{font-family:"Times New Roman",Georgia,serif;font-size:12pt;line-height:1.4;color:#111;}',
    '.doc-testata{text-align:center;margin-bottom:14pt;}',
    '.doc-scuola{font-size:14pt;font-weight:bold;text-transform:uppercase;}',
    '.doc-sottotitolo{font-size:11pt;}',
    '.doc-titolo{font-size:18pt;margin:12pt 0 2pt;text-transform:uppercase;letter-spacing:1px;}',
    '.doc-anno{font-size:12pt;}',
    '.doc h2{font-size:13pt;margin:16pt 0 6pt;padding-bottom:2pt;border-bottom:1px solid #444;}',
    '.doc-tab{border-collapse:collapse;width:100%;margin:6pt 0;}',
    '.doc-tab th,.doc-tab td{border:1px solid #666;padding:3pt 5pt;vertical-align:top;text-align:left;font-size:11pt;}',
    '.doc-tab th{background:#eee;}',
    '.doc-dati th{width:30%;}',
    '.doc-campi th{width:60%;font-weight:normal;}',
    '.doc-uda td,.doc-uda th{font-size:10pt;}',
    '.doc-sotto{font-weight:bold;margin:8pt 0 2pt;}',
    '.doc-vuoto{color:#777;font-style:italic;}',
    '.doc ul,.doc ol{margin:4pt 0 4pt 18pt;padding:0;}',
    '.doc p{margin:4pt 0;}',
    '.doc-firma{margin-top:28pt;display:flex;flex-wrap:wrap;gap:12pt;justify-content:space-between;align-items:flex-end;}',
    '.doc-firma-docente{text-align:center;min-width:160px;}',
    '.doc-firma-docente span{display:inline-block;margin-top:24pt;border-top:1px solid #111;min-width:160px;padding-top:2pt;}'
  ].join('\n');

  // Documento HTML autonomo che Word e LibreOffice aprono come .doc.
  function documentoWord(piani, modello) {
    var corpo = piani.map(function (p, i) {
      return (i ? '<br clear="all" style="page-break-before:always">' : '') + renderPiano(p, modello);
    }).join('');
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>Piano di lavoro</title>' +
      '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
      '<style>@page{size:21cm 29.7cm;margin:2cm;}body{margin:0;}' + CSS_DOCUMENTO +
      // Word non gestisce flexbox: firma su due righe.
      '.doc-firma{display:block;}.doc-firma-docente{text-align:right;margin-top:12pt;}</style></head><body>' +
      corpo + '</body></html>';
  }

  var api = {
    esc: esc,
    renderPiano: renderPiano,
    documentoWord: documentoWord,
    CSS_DOCUMENTO: CSS_DOCUMENTO
  };

  root.PDL = root.PDL || {};
  root.PDL.documento = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
