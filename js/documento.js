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
      html += '<table class="doc-campi">' + campi.map(function (c) {
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
    return '<table class="doc-uda"><thead><tr><th style="width:4%">N.</th><th style="width:22%">Unità e tempi</th>' +
      '<th style="width:18%">Nuclei tematici</th><th style="width:28%">Obiettivi di apprendimento</th><th style="width:28%">Contenuti e attività</th></tr></thead><tbody>' +
      unita.map(function (u, i) {
        var tempi = [u.periodo, u.ore ? u.ore + ' ore' : ''].filter(Boolean).join(' · ');
        return '<tr><td>' + (i + 1) + '</td><td><strong>' + multilinea(u.titolo) + '</strong>' +
          (tempi ? '<br><em>' + esc(tempi) + '</em>' : '') + '</td><td>' + esc((u.nuclei || []).join('; ')) +
          '</td><td>' + multilinea(u.obiettivi) + '</td><td>' + multilinea(u.contenuti) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  var ETICHETTA_ALTRI = { argomenti: 'Altri argomenti', obiettivi: 'Altri obiettivi', obiettiviMinimi: 'Altri obiettivi minimi' };

  function sezioneArgomenti(piano, sez, modello, banca) {
    var scelti = model.argomentiScelti(piano, sez, modello, banca);
    var conTitoli = scelti.gruppi.some(function (g) { return g.titolo; });
    var html = scelti.gruppi.map(function (g) {
      return (g.titolo ? '<p class="doc-sotto">' + esc(g.titolo) + '</p>' : '') + elenco(g.voci);
    }).join('');
    if (scelti.altri.length) {
      html += (conTitoli ? '<p class="doc-sotto">' + ETICHETTA_ALTRI[model.catalogoSezione(sez)] + '</p>' : '') + elenco(scelti.altri);
    }
    var note = model.valoreSezione(piano, sez).note;
    if (String(note || '').trim()) html += paragrafi(note);
    return html || VUOTO;
  }

  function corpoSezione(piano, sez, modello, banca) {
    switch (sez.tipo) {
      case 'situazione': return sezioneSituazione(piano, sez, modello);
      case 'checklist':
      case 'traguardi': return sezioneChecklist(piano, sez, modello);
      case 'argomenti': return sezioneArgomenti(piano, sez, modello, banca);
      case 'uda': return sezioneUda(piano, sez);
      case 'testo': {
        var t = model.valoreSezione(piano, sez).note;
        return String(t || '').trim() ? paragrafi(t) : VUOTO;
      }
      default: return '';
    }
  }

  // Dati del piano su due colonne (etichetta, valore, etichetta, valore).
  function tabellaDati(piano) {
    var voci = model.CAMPI_DATI.filter(function (c) {
      return ['anno', 'sezione'].indexOf(c.id) < 0 && String(piano[c.id] || '').trim();
    }).map(function (c) {
      return [c.etichetta, c.id === 'classe' ? piano.classe + (piano.sezione ? ' ' + piano.sezione : '') : piano[c.id]];
    });
    if (!voci.length) return '';
    var righe = [];
    for (var i = 0; i < voci.length; i += 2) {
      var a = voci[i];
      var b = voci[i + 1];
      righe.push('<tr><th>' + esc(a[0]) + '</th>' + (b
        ? '<td>' + esc(a[1]) + '</td><th>' + esc(b[0]) + '</th><td>' + esc(b[1]) + '</td>'
        : '<td colspan="3">' + esc(a[1]) + '</td>') + '</tr>');
    }
    return '<table class="doc-dati">' + righe.join('') + '</table>';
  }

  // Intestazione centrata. Si usano div e p con align="center" (oltre al CSS)
  // perché Word ignora gli elementi HTML5 come <header>.
  function intestazione(piano, modello) {
    var sc = modello.scuola;
    return '<div class="doc-testata" align="center">' +
      (sc.nome ? '<p class="doc-scuola" align="center">' + esc(sc.nome) + '</p>' : '') +
      (sc.sottotitolo ? '<p class="doc-sottotitolo" align="center">' + esc(sc.sottotitolo) + '</p>' : '') +
      '<h1 class="doc-titolo" align="center">' + esc(sc.titoloDocumento || 'Piano di lavoro annuale') + '</h1>' +
      '<p class="doc-anno" align="center">Anno scolastico ' + esc(piano.anno || sc.annoScolastico) + '</p>' +
      '</div>' + tabellaDati(piano);
  }

  // Firma in una tabella senza bordi: si impagina allo stesso modo nel browser e in Word.
  function firma(piano, modello) {
    var luogo = modello.scuola.citta ? esc(modello.scuola.citta) + ', ' : 'Luogo e data: ';
    return '<table class="doc-firma"><tr><td class="doc-firma-data">' + luogo + '____________________</td>' +
      '<td class="doc-firma-docente" align="center">Il/La docente<br><br>____________________________<br>' +
      esc(piano.docente || '') + '</td></tr></table>';
  }

  // banca: banca personale del docente (facoltativa).
  function renderPiano(piano, modello, banca) {
    var n = 0;
    var corpo = model.sezioniAttive(modello).filter(function (s) { return s.tipo !== 'dati'; }).map(function (s) {
      n++;
      return '<div class="doc-sezione"><h2>' + n + '. ' + esc(s.titolo) + '</h2>' + corpoSezione(piano, s, modello, banca) + '</div>';
    }).join('');
    return '<div class="doc">' + intestazione(piano, modello) + corpo + firma(piano, modello) + '</div>';
  }

  // Stili del documento, condivisi da anteprima, stampa e Word: carattere
  // senza grazie e un solo colore di accento.
  var CSS_DOCUMENTO = [
    '.doc{font-family:Calibri,"Segoe UI",Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.4;color:#1f2933;}',
    '.doc-testata{text-align:center;margin:0 0 12pt;padding:0 0 10pt;border-bottom:2pt solid #1f5fa8;}',
    '.doc-scuola{font-size:13pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#1f5fa8;text-align:center;margin:0;}',
    '.doc-sottotitolo{font-size:10.5pt;color:#4b5563;text-align:center;margin:2pt 0 0;}',
    '.doc-titolo{font-family:Calibri,"Segoe UI",Arial,Helvetica,sans-serif;font-size:20pt;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#163f73;text-align:center;margin:14pt 0 2pt;}',
    '.doc-anno{font-size:11pt;color:#4b5563;text-align:center;margin:0;}',
    '.doc h2{font-family:Calibri,"Segoe UI",Arial,Helvetica,sans-serif;font-size:13pt;font-weight:bold;color:#1f5fa8;margin:18pt 0 6pt;padding:0 0 3pt;border-bottom:1pt solid #c5d4ea;}',
    // Una sola classe per tabella: Word non gestisce gli elementi con più classi.
    '.doc-tab,.doc-dati,.doc-campi,.doc-uda{border-collapse:collapse;width:100%;margin:6pt 0;}',
    '.doc-tab th,.doc-tab td,.doc-dati th,.doc-dati td,.doc-campi th,.doc-campi td,.doc-uda th,.doc-uda td{border:1pt solid #c5d4ea;padding:4pt 6pt;vertical-align:top;text-align:left;font-size:10.5pt;}',
    '.doc-tab th,.doc-dati th,.doc-campi th,.doc-uda th{background:#eef3fa;color:#163f73;font-weight:bold;}',
    '.doc-dati th{width:17%;}',
    '.doc-dati td{width:33%;}',
    '.doc-campi th{width:60%;font-weight:normal;}',
    '.doc-uda td,.doc-uda th{font-size:9.5pt;}',
    '.doc-sotto{font-weight:bold;color:#163f73;margin:9pt 0 2pt;}',
    '.doc-vuoto{color:#8a94a3;font-style:italic;}',
    '.doc ul,.doc ol{margin:3pt 0 6pt 18pt;padding:0;}',
    '.doc li{margin:1pt 0;}',
    '.doc p{margin:4pt 0;}',
    '.doc-firma{width:100%;border-collapse:collapse;margin-top:30pt;}',
    '.doc-firma td{border:none;padding:0;vertical-align:bottom;font-size:11pt;}',
    '.doc-firma-docente{text-align:center;width:45%;}'
  ].join('\n');

  // Documento HTML autonomo che Word e LibreOffice aprono come .doc.
  // La sezione WordSection1 serve a Word per formato e margini della pagina.
  function documentoWord(piani, modello, banca) {
    var corpo = piani.map(function (p, i) {
      return (i ? '<br clear="all" style="page-break-before:always">' : '') + renderPiano(p, modello, banca);
    }).join('');
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>Piano di lavoro</title>' +
      '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
      '<style>@page WordSection1{size:21cm 29.7cm;margin:2cm 2cm 2cm 2cm;}div.WordSection1{page:WordSection1;}' +
      'body{margin:0;font-family:Calibri,Arial,sans-serif;}' + CSS_DOCUMENTO + '</style></head><body><div class="WordSection1">' +
      corpo + '</div></body></html>';
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
