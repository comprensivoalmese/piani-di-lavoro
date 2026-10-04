# Piani di lavoro

App web per compilare in modo **rapido e uniforme** i piani di lavoro annuali dei docenti
della scuola secondaria di primo grado.

- **Un solo modello per tutta la scuola**: il referente configura intestazione, sezioni,
  voci degli elenchi e discipline, poi distribuisce il modello ai colleghi (anche in sola lettura).
- **Compilazione a colpi di spunta**: competenze chiave europee, traguardi delle Indicazioni
  nazionali per ogni disciplina, metodologie, strumenti, verifiche, criteri di valutazione,
  recupero e potenziamento, inclusione, educazione civica, rapporti con le famiglie.
- **Argomenti trattati**: per ogni disciplina e per ogni classe (prima, seconda, terza) un elenco di
  argomenti raggruppati (es. per Musica: Acustica, Strumenti, Lettura…) da spuntare; si possono
  mostrare anche quelli delle altre classi. Gli argomenti svolti in più si aggiungono alla **banca
  personale** del docente, che li ripropone in tutti i suoi piani ed è inclusa nei backup.
- **Unità di apprendimento** con periodo, ore, nuclei tematici della disciplina, obiettivi e contenuti.
- **Scorciatoie**: più classi in un colpo solo («A, B, C»), duplicazione, copia dal piano
  dell'anno precedente o di un collega, copia delle UdA da un altro piano.
- **Indice con avanzamento**: si vede subito quali sezioni mancano.
- **Uscite**: anteprima, stampa/PDF e documento Word con impaginazione identica per tutti;
  stampa di più piani insieme (es. per il consiglio di classe).
- **Nessun server, nessun account**: i dati restano nel browser del docente; esportazione e
  importazione in file `.json` per backup, condivisione e cambio di computer.

## Come si usa

Non serve installare nulla: basta aprire `index.html` con un browser aggiornato
(Chrome, Edge, Firefox, Safari). In alternativa si può pubblicare la cartella su un
qualsiasi hosting statico, ad esempio GitHub Pages (Settings → Pages → Deploy from a branch).

1. **Referente**: *Modello d'istituto* → nome della scuola, sezioni, voci e discipline →
   *Esporta il modello* → invio del file `modello-istituto.json` ai docenti.
2. **Docenti**: *Importa file* → scelta del modello ricevuto → *+ Nuovo piano*.
3. *Anteprima e stampa* per il PDF, *Scarica Word* per il file modificabile.

Se l'app è pubblicata online, basta salvare `modello-istituto.json` accanto a `index.html`:
viene caricato automaticamente al primo avvio e, quando viene aggiornato, ai docenti compare
un avviso per applicare la nuova versione.

Il file `modello-istituto.json` di questo repository è il modello dell'Istituto Comprensivo di Almese,
ricavato dal modello cartaceo dei piani di lavoro: i docenti che usano il link della scuola lo ricevono
in automatico, in sola lettura. Le discipline non sono nel file: si usano quelle predefinite dell'app.

## Dati

I piani sono salvati nel `localStorage` del browser, quindi solo su quel computer e in quel
browser. È importante fare periodicamente *Backup di tutti i piani* dall'elenco.

## Struttura del codice

| File | Contenuto |
| --- | --- |
| `index.html`, `css/style.css` | Pagina e stili (anche di stampa) |
| `js/defaults.js` | Modello predefinito: sezioni, voci, discipline, traguardi e nuclei tematici |
| `js/argomenti.js` | Argomenti proposti per disciplina e classe |
| `js/model.js` | Logica dei dati (piani, completamento, import/export), senza DOM |
| `js/documento.js` | Generazione del documento per anteprima, stampa e Word |
| `js/store.js` | Salvataggio nel browser e caricamento del modello d'istituto |
| `js/app.js` | Interfaccia |

JavaScript senza dipendenze e senza passaggi di build. Dopo ogni modifica a JS o CSS aumentare il
numero `?v=` in `index.html`, così i browser non usano file vecchi rimasti in cache. Test (Node.js 18+):

```sh
npm test
```

## Riferimenti

Indicazioni nazionali per il curricolo (D.M. 254/2012) e Nuovi scenari (2018);
Raccomandazione UE del 22 maggio 2018 sulle competenze chiave; D.Lgs. 62/2017;
L. 104/1992, L. 170/2010 e normativa BES; L. 92/2019 e Linee guida per l'educazione civica
(D.M. 183/2024). I traguardi sono riportati dalle Indicazioni nazionali, talvolta in forma
sintetica, e possono essere adattati nel modello d'istituto.
