/*
 * Lettura del testo di un piano di lavoro da file Word (.docx e .doc),
 * OpenDocument (.odt), PDF, HTML e testo semplice. Tutto avviene nel browser:
 * il file non viene inviato da nessuna parte.
 * Ogni lettore restituisce un elenco di righe { testo, titolo, spuntata }:
 * "titolo" indica un titolo riconoscibile dalla formattazione, "spuntata"
 * vale false per una casella di controllo non selezionata.
 */
(function (root) {
  'use strict';

  var utf8 = new TextDecoder('utf-8');

  /* ---------- Archivi ZIP (.docx, .odt) ---------- */

  async function leggiDaZip(buffer, percorso) {
    var b = new Uint8Array(buffer);
    var dv = new DataView(buffer);
    var fine = b.length - 22;
    while (fine >= 0 && dv.getUint32(fine, true) !== 0x06054b50) fine--;
    if (fine < 0) throw new Error('Il file è danneggiato o non è un documento valido.');
    var voci = dv.getUint16(fine + 10, true);
    var p = dv.getUint32(fine + 16, true);
    for (var i = 0; i < voci; i++) {
      var metodo = dv.getUint16(p + 10, true);
      var compresso = dv.getUint32(p + 20, true);
      var lnNome = dv.getUint16(p + 28, true);
      var lnExtra = dv.getUint16(p + 30, true);
      var lnCommento = dv.getUint16(p + 32, true);
      var locale = dv.getUint32(p + 42, true);
      var nome = utf8.decode(b.subarray(p + 46, p + 46 + lnNome));
      if (nome === percorso) {
        var inizio = locale + 30 + dv.getUint16(locale + 26, true) + dv.getUint16(locale + 28, true);
        var dati = b.subarray(inizio, inizio + compresso);
        if (metodo === 0) return utf8.decode(dati);
        if (metodo === 8) {
          var flusso = new Blob([dati]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
          return utf8.decode(await new Response(flusso).arrayBuffer());
        }
        throw new Error('Compressione del file non supportata.');
      }
      p += 46 + lnNome + lnExtra + lnCommento;
    }
    return null;
  }

  /* ---------- Word .docx ---------- */

  var W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  var W14 = 'http://schemas.microsoft.com/office/word/2010/wordml';

  function figli(el, ns, nome) {
    return Array.prototype.slice.call(el.getElementsByTagNameNS(ns, nome));
  }

  // Stato delle caselle di controllo: campi modulo di Word e controlli contenuto.
  function casellaDocx(p) {
    var legacy = figli(p, W, 'checkBox')[0];
    if (legacy) {
      var valore = figli(legacy, W, 'checked')[0] || figli(legacy, W, 'default')[0];
      if (!valore) return false;
      var v = valore.getAttributeNS(W, 'val');
      return v !== '0' && v !== 'false';
    }
    var moderna = figli(p, W14, 'checked')[0];
    if (moderna) return moderna.getAttributeNS(W14, 'val') === '1';
    return null;
  }

  function testoParagrafoDocx(p) {
    var testo = '';
    var campo = false;
    var visita = function (n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType !== 1) continue;
        if (c.namespaceURI === W) {
          if (c.localName === 'fldChar') {
            var tipo = c.getAttributeNS(W, 'fldCharType');
            if (tipo === 'begin') campo = true;
            if (tipo === 'separate' || tipo === 'end') campo = false;
            continue;
          }
          if (c.localName === 'instrText' || c.localName === 'del' || c.localName === 'pPr' || c.localName === 'rPr') continue;
          if (c.localName === 't' && !campo) { testo += c.textContent; continue; }
          if (c.localName === 'tab') { testo += ' '; continue; }
          if (c.localName === 'br' || c.localName === 'cr') { testo += '\n'; continue; }
        }
        visita(c);
      }
    };
    visita(p);
    return testo;
  }

  function eTitoloDocx(p, testo) {
    var stile = figli(p, W, 'pStyle')[0];
    var nome = stile ? stile.getAttributeNS(W, 'val') || '' : '';
    if (/heading|titolo|title|intestazione/i.test(nome) || figli(p, W, 'outlineLvl').length) return true;
    // Paragrafo breve tutto in grassetto.
    var corse = figli(p, W, 'r').filter(function (r) { return figli(r, W, 't').some(function (t) { return t.textContent.trim(); }); });
    if (!corse.length || testo.length > 90) return false;
    return corse.every(function (r) {
      var g = figli(r, W, 'b')[0];
      return g && g.getAttributeNS(W, 'val') !== '0' && g.getAttributeNS(W, 'val') !== 'false';
    });
  }

  async function righeDocx(buffer) {
    var xml = await leggiDaZip(buffer, 'word/document.xml');
    if (!xml) throw new Error('Il file non contiene un documento Word.');
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    return figli(doc, W, 'p').map(function (p) {
      var testo = testoParagrafoDocx(p);
      return { testo: testo, titolo: eTitoloDocx(p, testo.trim()), spuntata: casellaDocx(p) };
    });
  }

  /* ---------- OpenDocument .odt ---------- */

  var T = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0';

  async function righeOdt(buffer) {
    var xml = await leggiDaZip(buffer, 'content.xml');
    if (!xml) throw new Error('Il file non contiene un documento OpenDocument.');
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var righe = [];
    figli(doc, T, '*').forEach(function (el) {
      if (el.localName !== 'h' && el.localName !== 'p') return;
      var testo = '';
      var visita = function (n) {
        for (var c = n.firstChild; c; c = c.nextSibling) {
          if (c.nodeType === 3) testo += c.nodeValue;
          else if (c.nodeType === 1) {
            if (c.namespaceURI === T && (c.localName === 's' || c.localName === 'tab')) testo += ' ';
            else if (c.namespaceURI === T && c.localName === 'line-break') testo += '\n';
            else if (!(c.namespaceURI === T && (c.localName === 'p' || c.localName === 'h' || c.localName === 'note'))) visita(c);
          }
        }
      };
      visita(el);
      righe.push({ testo: testo, titolo: el.localName === 'h' });
    });
    return righe;
  }

  /* ---------- Word .doc (formato binario 97-2003) ---------- */

  // Contenitore OLE (Compound File Binary): restituisce una funzione che legge un flusso per nome.
  function apriCfb(b) {
    var dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    var settore = 1 << dv.getUint16(30, true);
    var mini = 1 << dv.getUint16(32, true);
    var nFat = dv.getUint32(44, true);
    var inizioDir = dv.getUint32(48, true);
    var soglia = dv.getUint32(56, true);
    var inizioMiniFat = dv.getUint32(60, true);
    var nMiniFat = dv.getUint32(64, true);
    var inizioDifat = dv.getUint32(68, true);
    var FINE = 0xFFFFFFFA;
    var posizione = function (s) { return (s + 1) * settore; };

    var settoriFat = [];
    for (var i = 0; i < 109 && settoriFat.length < nFat; i++) settoriFat.push(dv.getUint32(76 + i * 4, true));
    var d = inizioDifat;
    while (settoriFat.length < nFat && d < FINE) {
      for (var j = 0; j < settore / 4 - 1 && settoriFat.length < nFat; j++) settoriFat.push(dv.getUint32(posizione(d) + j * 4, true));
      d = dv.getUint32(posizione(d) + settore - 4, true);
    }
    var fat = [];
    settoriFat.forEach(function (s) {
      for (var k = 0; k < settore / 4; k++) fat.push(dv.getUint32(posizione(s) + k * 4, true));
    });

    var catena = function (s, tabella) {
      var out = [];
      while (s < FINE && out.length < 1e6) { out.push(s); s = tabella[s]; }
      return out;
    };
    var leggiCatena = function (s, dim) {
      var parti = catena(s, fat);
      var out = new Uint8Array(parti.length * settore);
      parti.forEach(function (x, n) { out.set(b.subarray(posizione(x), posizione(x) + settore), n * settore); });
      return dim == null ? out : out.subarray(0, dim);
    };

    var dir = leggiCatena(inizioDir);
    var voci = [];
    for (var v = 0; v + 128 <= dir.length; v += 128) {
      var vdv = new DataView(dir.buffer, dir.byteOffset + v, 128);
      var ln = vdv.getUint16(64, true);
      var nome = '';
      for (var c = 0; c + 2 < ln; c += 2) nome += String.fromCharCode(vdv.getUint16(c, true));
      voci.push({ nome: nome, tipo: dir[v + 66], inizio: vdv.getUint32(116, true), dim: vdv.getUint32(120, true) });
    }

    var ministream = null;
    var miniFat = null;
    return function (nome) {
      var voce = voci.find(function (x) { return x.nome === nome && x.tipo === 2; });
      if (!voce) return null;
      if (voce.dim >= soglia) return leggiCatena(voce.inizio, voce.dim);
      if (!ministream) {
        ministream = leggiCatena(voci[0].inizio, voci[0].dim);
        var mf = leggiCatena(inizioMiniFat);
        var mdv = new DataView(mf.buffer, mf.byteOffset, mf.byteLength);
        miniFat = [];
        for (var m = 0; m < nMiniFat * settore / 4; m++) miniFat.push(mdv.getUint32(m * 4, true));
      }
      var parti = catena(voce.inizio, miniFat);
      var out = new Uint8Array(parti.length * mini);
      parti.forEach(function (x, n) { out.set(ministream.subarray(x * mini, x * mini + mini), n * mini); });
      return out.subarray(0, voce.dim);
    };
  }

  // Testo principale di un documento Word 97-2003, ricostruito dalla tabella dei pezzi.
  function testoDoc(b) {
    var flusso = apriCfb(b);
    var wd = flusso('WordDocument');
    if (!wd) throw new Error('Il file non contiene un documento Word.');
    var dv = new DataView(wd.buffer, wd.byteOffset, wd.byteLength);
    if (dv.getUint16(0, true) !== 0xA5EC) throw new Error('Documento Word non riconosciuto.');
    var opzioni = dv.getUint16(0x0A, true);
    if (opzioni & 0x0100) throw new Error('Il documento è protetto da password.');
    var tabella = flusso(opzioni & 0x0200 ? '1Table' : '0Table');
    var ccpText = dv.getUint32(0x4C, true);
    var fcClx = dv.getUint32(0x01A2, true);
    var lcbClx = dv.getUint32(0x01A6, true);
    var clx = tabella.subarray(fcClx, fcClx + lcbClx);
    var cdv = new DataView(clx.buffer, clx.byteOffset, clx.byteLength);
    var i = 0;
    while (clx[i] === 0x01) i += 3 + cdv.getInt16(i + 1, true);
    if (clx[i] !== 0x02) throw new Error('Struttura del documento Word non riconosciuta.');
    var lcb = cdv.getUint32(i + 1, true);
    var plc = i + 5;
    var n = (lcb - 4) / 12;
    var cp1252 = new TextDecoder('windows-1252');
    var utf16 = new TextDecoder('utf-16le');
    var testo = '';
    for (var k = 0; k < n && testo.length < ccpText; k++) {
      var cpA = cdv.getUint32(plc + k * 4, true);
      var cpB = cdv.getUint32(plc + (k + 1) * 4, true);
      var fc = cdv.getUint32(plc + (n + 1) * 4 + k * 8 + 2, true);
      var compresso = (fc & 0x40000000) !== 0;
      var lunghezza = cpB - cpA;
      if (compresso) {
        var da = (fc & 0x3FFFFFFF) / 2;
        testo += cp1252.decode(wd.subarray(da, da + lunghezza));
      } else {
        testo += utf16.decode(wd.subarray(fc, fc + lunghezza * 2));
      }
    }
    return testo.slice(0, ccpText);
  }

  // Campi di Word: \x13 codice \x14 risultato \x15. Si tiene solo il risultato.
  function togliCampi(testo) {
    var out = '';
    var pila = [];
    for (var i = 0; i < testo.length; i++) {
      var c = testo[i];
      if (c === '\x13') { pila.push('codice'); continue; }
      if (c === '\x14') { if (pila.length) pila[pila.length - 1] = 'risultato'; continue; }
      if (c === '\x15') { pila.pop(); continue; }
      if (!pila.length || pila[pila.length - 1] === 'risultato') out += c;
    }
    return out;
  }

  function righeDoc(b) {
    var testo = togliCampi(testoDoc(b))
      .replace(/\x07/g, '\r')            // fine cella di tabella
      .replace(/[\x0b\x0c\x0e]/g, '\r')  // a capo manuale, interruzione di pagina e di colonna
      .replace(/[\x00-\x08\x10-\x1f]/g, '');
    return testo.split('\r').map(function (t) { return { testo: t }; });
  }

  /* ---------- PDF ---------- */

  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

  function caricaPdfJs() {
    if (root.pdfjsLib) return Promise.resolve(root.pdfjsLib);
    return new Promise(function (risolvi, rifiuta) {
      var s = document.createElement('script');
      s.src = PDFJS + 'pdf.min.js';
      s.onload = function () {
        root.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
        risolvi(root.pdfjsLib);
      };
      s.onerror = function () { rifiuta(new Error('Impossibile caricare il lettore di PDF: controlla la connessione.')); };
      document.head.append(s);
    });
  }

  // Ricompone le righe raggruppando i frammenti di testo alla stessa altezza.
  async function righePdf(buffer) {
    var pdfjs = await caricaPdfJs();
    var pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    var righe = [];
    for (var n = 1; n <= pdf.numPages; n++) {
      var pagina = await pdf.getPage(n);
      var contenuto = await pagina.getTextContent();
      var gruppi = [];
      contenuto.items.forEach(function (it) {
        if (!it.str || !it.str.trim()) { if (it.hasEOL && gruppi.length) gruppi[gruppi.length - 1].chiusa = true; return; }
        var x = it.transform[4];
        var y = it.transform[5];
        var altezza = Math.abs(it.transform[3]) || it.height || 10;
        var ultimo = gruppi[gruppi.length - 1];
        if (ultimo && !ultimo.chiusa && Math.abs(ultimo.y - y) < altezza * 0.5) {
          // pdf.js a volte spezza una parola in più pezzi: lo spazio va messo solo se c'è distanza.
          var distanza = x - ultimo.xFine;
          var spazio = !/\s$/.test(ultimo.testo) && !/^\s/.test(it.str) && distanza > altezza * 0.15;
          ultimo.testo += (spazio ? ' ' : '') + it.str;
          ultimo.altezza = Math.max(ultimo.altezza, altezza);
          ultimo.xFine = x + (it.width || 0);
        } else {
          gruppi.push({ y: y, testo: it.str, altezza: altezza, xFine: x + (it.width || 0) });
        }
        if (it.hasEOL) gruppi[gruppi.length - 1].chiusa = true;
      });
      righe = righe.concat(gruppi);
    }
    // Le righe con caratteri più grandi del testo normale sono titoli.
    var altezze = righe.map(function (r) { return r.altezza; }).sort(function (a, b) { return a - b; });
    var normale = altezze[Math.floor(altezze.length / 2)] || 10;
    // Nel PDF ogni riga va a capo: si riuniscono le righe che continuano la frase
    // precedente (iniziano con la minuscola), anche quando una parola è spezzata dal trattino.
    var unite = [];
    righe.forEach(function (r) {
      var testo = r.testo.trim();
      var titolo = r.altezza > normale * 1.15;
      var prec = unite[unite.length - 1];
      if (prec && !prec.titolo && !titolo && /^[a-zà-ÿ(]/.test(testo) && !/[.;:!?]$/.test(prec.testo)) {
        prec.testo = /-$/.test(prec.testo) ? prec.testo.replace(/\s*-$/, '-') + testo : prec.testo + ' ' + testo;
      } else {
        unite.push({ testo: testo, titolo: titolo });
      }
    });
    return unite;
  }

  /* ---------- HTML e testo ---------- */

  function righeHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var blocchi = 'h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,caption,div';
    var righe = [];
    Array.prototype.forEach.call(doc.body ? doc.body.querySelectorAll(blocchi) : [], function (el) {
      if (el.querySelector(blocchi)) return;
      righe.push({ testo: el.textContent, titolo: /^H\d$/.test(el.tagName) });
    });
    return righe;
  }

  function righeTesto(testo) {
    return testo.split(/\r?\n/).map(function (t) { return { testo: t }; });
  }

  /* ---------- Ingresso ---------- */

  var ESTENSIONI = '.docx,.doc,.odt,.pdf,.txt,.html,.htm';

  async function leggiDocumento(file) {
    var nome = (file.name || '').toLowerCase();
    var buffer = await file.arrayBuffer();
    var b = new Uint8Array(buffer);
    var inizio = utf8.decode(b.subarray(0, 8));
    if (/\.docx$/.test(nome)) return righeDocx(buffer);
    if (/\.odt$/.test(nome)) return righeOdt(buffer);
    if (/\.pdf$/.test(nome)) return righePdf(buffer);
    if (/\.doc$/.test(nome)) {
      if (b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0) return righeDoc(b);
      if (b[0] === 0x50 && b[1] === 0x4B) return righeDocx(buffer);
      if (/^\{\\rtf/.test(inizio)) throw new Error('Questo file .doc è in formato RTF: aprilo con Word e salvalo come .docx, poi importalo di nuovo.');
      // Un .doc può essere una pagina HTML, come quelli scaricati da questa app.
      return righeHtml(utf8.decode(b));
    }
    if (/\.html?$/.test(nome)) return righeHtml(utf8.decode(b));
    if (/\.txt$/.test(nome)) return righeTesto(utf8.decode(b));
    throw new Error('Formato non supportato: usa un file Word, PDF, OpenDocument o di testo.');
  }

  root.PDL = root.PDL || {};
  root.PDL.lettura = { leggiDocumento: leggiDocumento, ESTENSIONI: ESTENSIONI };
})(window);
