/*
 * Obiettivi specifici (conoscenze e abilità) e obiettivi minimi proposti per
 * ogni disciplina e classe. Sono un punto di partenza: il referente li adatta
 * al curricolo d'istituto e ogni docente può aggiungerne di propri.
 * Formato: una voce per riga, le righe che finiscono con ":" sono i titoli
 * dei gruppi (di solito i nuclei della disciplina).
 */
(function (root) {
  'use strict';

  var OBIETTIVI = {
    'Italiano': {
      1: `Ascolto e parlato:
        Ascoltare testi di vario tipo individuandone argomento e informazioni principali
        Intervenire nelle conversazioni in modo pertinente, rispettando tempi e turni di parola
        Riferire oralmente esperienze e argomenti di studio in modo chiaro e ordinato
        Lettura:
        Leggere ad alta voce in modo corretto e scorrevole
        Leggere e comprendere testi narrativi, descrittivi e poetici individuandone gli elementi fondamentali
        Scrittura:
        Scrivere testi narrativi e descrittivi corretti, coerenti e adeguati allo scopo
        Riassumere testi letti o ascoltati
        Lessico e riflessione sulla lingua:
        Ampliare il lessico e usare il dizionario
        Usare correttamente le regole ortografiche e la punteggiatura
        Riconoscere e analizzare le parti del discorso`,
      2: `Ascolto e parlato:
        Ascoltare testi riconoscendone scopo, argomento e informazioni principali
        Esporre argomenti di studio in modo ordinato, con un lessico adeguato
        Esprimere e motivare il proprio punto di vista
        Lettura:
        Leggere e comprendere testi espositivi, autobiografici e letterari
        Collocare autori e opere nel contesto storico-letterario
        Scrittura:
        Scrivere lettere, diari e testi espositivi corretti e coerenti
        Parafrasare e riassumere testi
        Lessico e riflessione sulla lingua:
        Riconoscere e analizzare la struttura della frase semplice
        Usare in modo consapevole la morfologia nella produzione scritta`,
      3: `Ascolto e parlato:
        Ascoltare e comprendere testi argomentativi e informativi, anche trasmessi dai media
        Esporre argomenti di studio in modo chiaro e organizzato, operando collegamenti
        Argomentare una tesi con dati pertinenti
        Lettura:
        Leggere e comprendere testi letterari e non letterari, interpretandoli in modo personale
        Riconoscere le caratteristiche dei principali generi e autori della letteratura italiana
        Scrittura:
        Scrivere testi argomentativi ed espositivi corretti, coerenti e adeguati alla situazione
        Rielaborare informazioni ricavate da più fonti
        Lessico e riflessione sulla lingua:
        Riconoscere e analizzare la struttura del periodo
        Usare un lessico ricco e appropriato ai diversi contesti`
    },
    'Storia': {
      1: `Uso delle fonti:
        Riconoscere e usare fonti di diverso tipo
        Organizzazione delle informazioni:
        Collocare fatti ed eventi nello spazio e nel tempo
        Costruire linee del tempo, mappe e schemi
        Strumenti concettuali:
        Comprendere aspetti e processi fondamentali della storia medievale
        Produzione scritta e orale:
        Esporre le conoscenze acquisite usando il linguaggio specifico`,
      2: `Uso delle fonti:
        Usare fonti diverse per ricavare informazioni
        Organizzazione delle informazioni:
        Selezionare e organizzare le informazioni con mappe, schemi e tabelle
        Stabilire relazioni di causa ed effetto tra gli eventi
        Strumenti concettuali:
        Comprendere aspetti e processi fondamentali della storia moderna europea e italiana
        Produzione scritta e orale:
        Esporre le conoscenze in modo ordinato, operando semplici collegamenti`,
      3: `Uso delle fonti:
        Usare fonti di diverso tipo, anche digitali, per approfondire temi definiti
        Organizzazione delle informazioni:
        Collegare la storia locale, italiana, europea e mondiale
        Strumenti concettuali:
        Comprendere aspetti e processi fondamentali della storia contemporanea
        Usare le conoscenze per orientarsi nella complessità del presente
        Produzione scritta e orale:
        Argomentare su conoscenze e concetti appresi usando il linguaggio specifico`
    },
    'Geografia': {
      1: `Orientamento:
        Orientarsi sulle carte e nello spazio con i punti cardinali e le coordinate geografiche
        Linguaggio della geo-graficità:
        Leggere e interpretare carte, grafici e tabelle
        Paesaggio:
        Riconoscere gli elementi fisici e antropici del paesaggio italiano
        Regione e sistema territoriale:
        Conoscere le caratteristiche delle regioni italiane`,
      2: `Orientamento:
        Orientarsi sulle carte dell'Europa
        Linguaggio della geo-graficità:
        Usare carte tematiche, grafici e dati statistici
        Paesaggio:
        Confrontare i paesaggi europei
        Regione e sistema territoriale:
        Conoscere l'Unione europea e gli Stati europei nei loro aspetti fisici, economici e culturali`,
      3: `Orientamento:
        Orientarsi nelle realtà territoriali lontane
        Linguaggio della geo-graficità:
        Usare strumenti tradizionali e digitali per comunicare informazioni spaziali
        Paesaggio:
        Interpretare i paesaggi mondiali e i problemi di tutela dell'ambiente
        Regione e sistema territoriale:
        Analizzare temi e problemi del mondo contemporaneo: sviluppo, migrazioni, globalizzazione`
    },
    'Matematica': {
      1: `Numeri:
        Eseguire le quattro operazioni con i numeri naturali e decimali
        Usare le potenze e le proprietà delle operazioni
        Risolvere problemi con multipli, divisori, M.C.D. e m.c.m.
        Operare con le frazioni
        Spazio e figure:
        Riconoscere e rappresentare enti geometrici, angoli e poligoni
        Risolvere problemi sul perimetro dei poligoni
        Dati e previsioni:
        Raccogliere e rappresentare dati con tabelle e grafici`,
      2: `Numeri:
        Operare con frazioni e numeri decimali
        Calcolare la radice quadrata
        Usare rapporti, proporzioni e percentuali
        Spazio e figure:
        Calcolare l'area dei poligoni
        Applicare il teorema di Pitagora
        Riconoscere trasformazioni geometriche e figure simili
        Relazioni e funzioni:
        Rappresentare punti e figure nel piano cartesiano
        Riconoscere grandezze direttamente e inversamente proporzionali`,
      3: `Numeri:
        Operare con i numeri relativi
        Eseguire calcoli con monomi e polinomi
        Risolvere equazioni di primo grado
        Relazioni e funzioni:
        Rappresentare funzioni nel piano cartesiano
        Spazio e figure:
        Calcolare la lunghezza della circonferenza e l'area del cerchio
        Calcolare superfici e volumi dei solidi
        Dati e previsioni:
        Calcolare la probabilità di eventi semplici
        Leggere e interpretare dati statistici`
    },
    'Scienze': {
      1: `Fisica e chimica:
        Applicare le fasi del metodo sperimentale
        Riconoscere gli stati della materia e i passaggi di stato
        Distinguere calore e temperatura
        Biologia:
        Riconoscere le caratteristiche dei viventi e la struttura della cellula
        Classificare i viventi, le piante e gli animali
        Comprendere le relazioni negli ecosistemi`,
      2: `Fisica e chimica:
        Riconoscere atomi, molecole, elementi e composti
        Descrivere semplici reazioni chimiche
        Descrivere il moto e le forze
        Biologia:
        Conoscere struttura e funzioni degli apparati del corpo umano
        Adottare comportamenti corretti per la salute e l'alimentazione`,
      3: `Astronomia e Scienze della Terra:
        Descrivere la struttura della Terra e i fenomeni vulcanici e sismici
        Conoscere il Sistema solare e l'Universo
        Biologia:
        Conoscere il sistema nervoso e la riproduzione
        Comprendere le basi della genetica e dell'evoluzione
        Fisica e chimica:
        Comprendere i concetti di energia ed elettricità`
    },
    'Lingua inglese': {
      1: `Ascolto:
        Comprendere espressioni e frasi di uso quotidiano
        Parlato:
        Presentarsi e interagire in semplici scambi su argomenti familiari
        Lettura:
        Comprendere brevi testi su argomenti noti
        Scrittura:
        Scrivere brevi testi su sé stessi e sul proprio ambiente
        Riflessione sulla lingua:
        Riconoscere e usare le strutture grammaticali di base`,
      2: `Ascolto:
        Comprendere i punti essenziali di dialoghi e brevi testi
        Parlato:
        Descrivere azioni quotidiane e raccontare esperienze passate
        Lettura:
        Comprendere brevi testi descrittivi e narrativi
        Scrittura:
        Scrivere brevi messaggi, lettere e descrizioni
        Riflessione sulla lingua:
        Usare i tempi presenti, passati e futuri studiati`,
      3: `Ascolto:
        Comprendere i punti essenziali di testi su argomenti familiari e di studio
        Parlato:
        Esprimere opinioni, progetti ed esperienze
        Lettura:
        Comprendere testi di civiltà e di attualità
        Scrittura:
        Scrivere lettere e testi su argomenti noti
        Riflessione sulla lingua:
        Usare le strutture studiate, rilevando analogie e differenze con l'italiano`
    },
    'Seconda lingua comunitaria': {
      1: `Ascolto:
        Comprendere istruzioni ed espressioni di uso quotidiano
        Parlato:
        Presentarsi e chiedere informazioni personali
        Lettura:
        Comprendere brevi testi e messaggi
        Scrittura:
        Scrivere semplici frasi e messaggi su di sé
        Riflessione sulla lingua:
        Riconoscere le strutture di base della lingua`,
      2: `Ascolto:
        Comprendere brevi dialoghi su argomenti quotidiani
        Parlato:
        Descrivere abitudini e interagire in situazioni quotidiane
        Lettura:
        Comprendere brevi testi descrittivi
        Scrittura:
        Scrivere brevi messaggi e descrizioni
        Riflessione sulla lingua:
        Usare il presente, il futuro prossimo e il passato prossimo`,
      3: `Ascolto:
        Comprendere testi semplici su argomenti noti
        Parlato:
        Raccontare esperienze e progetti
        Lettura:
        Comprendere brevi testi di civiltà
        Scrittura:
        Scrivere brevi lettere e testi personali
        Riflessione sulla lingua:
        Confrontare le strutture della lingua con quelle dell'italiano e dell'inglese`
    },
    'Tecnologia': {
      1: `Vedere, osservare e sperimentare:
        Riconoscere proprietà e cicli di lavorazione dei materiali
        Riconoscere l'importanza della raccolta differenziata e del riciclo
        Prevedere, immaginare e progettare:
        Eseguire costruzioni geometriche con gli strumenti del disegno
        Intervenire, trasformare e produrre:
        Usare il computer per scrivere e organizzare informazioni`,
      2: `Vedere, osservare e sperimentare:
        Conoscere i settori dell'alimentazione, dell'agricoltura e dell'edilizia
        Prevedere, immaginare e progettare:
        Rappresentare oggetti in proiezione ortogonale
        Intervenire, trasformare e produrre:
        Usare il foglio di calcolo e le presentazioni multimediali`,
      3: `Vedere, osservare e sperimentare:
        Riconoscere fonti e forme di energia e il loro impatto ambientale
        Comprendere il funzionamento del circuito elettrico
        Prevedere, immaginare e progettare:
        Rappresentare oggetti in assonometria
        Intervenire, trasformare e produrre:
        Usare la rete in modo consapevole e sicuro
        Sviluppare semplici programmi (coding)`
    },
    'Musica': {
      1: `Comprendere e usare i linguaggi specifici:
        Riconoscere e analizzare i suoni secondo i quattro parametri (altezza, durata, timbro e intensità)
        Leggere e scrivere semplici sequenze ritmico-melodiche in notazione tradizionale e non tradizionale
        Esprimersi vocalmente e con l'uso di mezzi strumentali:
        Eseguire facili sequenze ritmiche/melodiche con strumenti e voce
        Eseguire in gruppo semplici brani
        Esprimere la propria creatività inventando semplici sequenze ritmico-melodiche
        Ascoltare e comprendere i fenomeni sonori e i messaggi musicali:
        Riconoscere e classificare all'ascolto gli strumenti musicali
        Analizzare la funzione comunicativa/affettiva dei brani`,
      2: `Comprendere e usare i linguaggi specifici:
        Leggere, scrivere e rielaborare brani musicali con i segni studiati
        Riconoscere strumenti, stili e forme musicali
        Esprimersi vocalmente e con l'uso di mezzi strumentali:
        Eseguire accompagnamenti ritmici
        Suonare e cantare brani di media difficoltà, anche con alterazioni, in piccoli gruppi e collettivamente
        Suonare e cantare facili melodie polifoniche
        Creare eventi sonori integrati con altri saperi utilizzando anche supporti multimediali e risorse in rete
        Esprimere la propria creatività anche improvvisando
        Ascoltare e comprendere i fenomeni sonori e i messaggi musicali:
        Riconoscere all'ascolto gli strumenti, gli stili e le forme
        Riconoscere le funzioni della musica`,
      3: `Comprendere e usare i linguaggi specifici:
        Leggere, scrivere e rielaborare brani musicali
        Usare software musicali
        Esprimere giudizi personali utilizzando una terminologia appropriata
        Esprimersi vocalmente e con l'uso di mezzi strumentali:
        Eseguire accompagnamenti ritmici
        Creare eventi sonori integrati con altri saperi utilizzando anche supporti multimediali e risorse in rete
        Esprimere la propria creatività anche improvvisando
        Suonare/cantare brani di vario repertorio, in piccoli gruppi o collettivamente, con accompagnamento
        Suonare/cantare brani polifonici
        Ascoltare e comprendere i fenomeni sonori e i messaggi musicali:
        Ascoltare e riconoscere brani strumentali e vocali appartenenti a generi e culture differenti
        Ascoltare e riconoscere strumenti, stili e forme
        Comprendere la relazione tra musica ed eventi storici`
    },
    'Arte e immagine': {
      1: `Esprimersi e comunicare:
        Usare punto, linea, colore e texture in elaborati personali
        Usare correttamente le tecniche grafiche
        Osservare e leggere le immagini:
        Riconoscere gli elementi del linguaggio visivo
        Comprendere e apprezzare le opere d'arte:
        Leggere le opere d'arte dalla Preistoria al Gotico`,
      2: `Esprimersi e comunicare:
        Rappresentare lo spazio con la prospettiva
        Usare luce, ombra e le tecniche pittoriche
        Osservare e leggere le immagini:
        Analizzare la composizione di un'immagine
        Comprendere e apprezzare le opere d'arte:
        Leggere le opere dal Rinascimento al Settecento collocandole nel loro contesto`,
      3: `Esprimersi e comunicare:
        Realizzare elaborati creativi con tecniche miste e linguaggi diversi
        Osservare e leggere le immagini:
        Leggere immagini e messaggi della comunicazione visiva
        Comprendere e apprezzare le opere d'arte:
        Leggere le opere dall'Ottocento all'arte contemporanea
        Riconoscere e rispettare i beni culturali del territorio`
    },
    'Educazione fisica': {
      1: `Il corpo e la sua relazione con lo spazio e il tempo:
        Consolidare gli schemi motori di base
        Migliorare le capacità coordinative
        Il linguaggio del corpo come modalità comunicativo-espressiva:
        Usare il corpo per esprimere stati d'animo
        Il gioco, lo sport, le regole e il fair play:
        Partecipare ai giochi rispettando regole e compagni
        Salute e benessere, prevenzione e sicurezza:
        Conoscere le norme di igiene e sicurezza`,
      2: `Il corpo e la sua relazione con lo spazio e il tempo:
        Migliorare le capacità condizionali
        Il linguaggio del corpo come modalità comunicativo-espressiva:
        Esprimersi con il corpo in situazioni diverse
        Il gioco, lo sport, le regole e il fair play:
        Conoscere fondamentali e regolamento dei giochi sportivi
        Praticare il fair play
        Salute e benessere, prevenzione e sicurezza:
        Riconoscere il valore del riscaldamento e dell'attività fisica`,
      3: `Il corpo e la sua relazione con lo spazio e il tempo:
        Gestire le capacità motorie in situazioni complesse
        Il gioco, lo sport, le regole e il fair play:
        Applicare tattiche e regole negli sport di squadra
        Svolgere compiti di arbitraggio
        Salute e benessere, prevenzione e sicurezza:
        Adottare stili di vita sani e conoscere i rischi del doping e delle dipendenze
        Conoscere le norme di primo soccorso`
    },
    'Religione cattolica': {
      1: `Dio e l'uomo:
        Cogliere le domande di senso dell'uomo e le risposte delle religioni
        La Bibbia e le altre fonti:
        Conoscere struttura e composizione della Bibbia
        Il linguaggio religioso:
        Riconoscere i simboli della fede
        I valori etici e religiosi:
        Conoscere il messaggio di Gesù`,
      2: `Dio e l'uomo:
        Conoscere l'origine e lo sviluppo della Chiesa
        La Bibbia e le altre fonti:
        Leggere gli Atti degli Apostoli
        Il linguaggio religioso:
        Riconoscere i sacramenti e l'anno liturgico
        I valori etici e religiosi:
        Riconoscere il valore della comunità`,
      3: `Dio e l'uomo:
        Confrontare le grandi religioni del mondo
        Cogliere il rapporto tra scienza e fede
        I valori etici e religiosi:
        Riflettere sulle scelte di vita, sulla libertà e sulla responsabilità
        Riconoscere il valore della dignità umana e della pace`
    }
  };

  // Gli obiettivi minimi non sono divisi in gruppi.
  var MINIMI = {
    'Italiano': {
      1: `Ascoltare e comprendere il senso globale di semplici testi
        Leggere in modo comprensibile e comprendere le informazioni principali di un testo
        Scrivere semplici testi rispettando le principali regole ortografiche
        Riconoscere le principali parti del discorso
        Esporre in modo semplice esperienze e contenuti studiati`,
      2: `Comprendere il contenuto essenziale di testi letti o ascoltati
        Esporre in modo semplice un argomento di studio
        Scrivere semplici testi corretti e comprensibili
        Riconoscere soggetto, predicato e principali complementi`,
      3: `Comprendere il messaggio essenziale di testi di diverso tipo
        Esporre in modo semplice e ordinato un argomento, anche con l'aiuto di una scaletta
        Scrivere testi semplici, corretti e pertinenti alla traccia
        Riconoscere la struttura essenziale della frase complessa`
    },
    'Storia': {
      1: `Collocare i principali eventi sulla linea del tempo
        Conoscere i fatti essenziali del Medioevo
        Rispondere a semplici domande sugli argomenti studiati`,
      2: `Collocare i principali eventi dell'età moderna nello spazio e nel tempo
        Riconoscere semplici rapporti di causa ed effetto
        Esporre in modo semplice i contenuti essenziali`,
      3: `Conoscere gli eventi essenziali del Novecento
        Collocare gli eventi principali nello spazio e nel tempo
        Esporre i contenuti essenziali con l'aiuto di schemi`
    },
    'Geografia': {
      1: `Orientarsi sulla carta con i punti cardinali
        Leggere semplici carte e grafici
        Conoscere gli elementi essenziali del territorio italiano`,
      2: `Localizzare i principali Stati europei
        Conoscere gli aspetti essenziali di uno Stato europeo
        Leggere semplici carte tematiche`,
      3: `Localizzare continenti e principali Stati del mondo
        Conoscere gli aspetti essenziali di un continente
        Comprendere in modo semplice un problema del mondo attuale`
    },
    'Matematica': {
      1: `Eseguire le quattro operazioni con i numeri naturali
        Risolvere semplici problemi con una o due operazioni
        Riconoscere i principali enti geometrici e poligoni`,
      2: `Eseguire semplici operazioni con le frazioni
        Calcolare l'area dei principali poligoni
        Applicare il teorema di Pitagora in casi semplici
        Calcolare una percentuale`,
      3: `Eseguire semplici operazioni con i numeri relativi
        Risolvere semplici equazioni di primo grado
        Calcolare area e volume dei solidi più semplici
        Leggere semplici grafici`
    },
    'Scienze': {
      1: `Conoscere le fasi del metodo sperimentale
        Riconoscere gli stati della materia
        Distinguere viventi e non viventi e i principali gruppi di viventi`,
      2: `Conoscere i principali apparati del corpo umano
        Distinguere elementi e composti
        Descrivere in modo semplice un fenomeno osservato`,
      3: `Conoscere la struttura essenziale della Terra
        Conoscere i corpi del Sistema solare
        Conoscere le funzioni essenziali del sistema nervoso
        Riconoscere le principali fonti di energia`
    },
    'Lingua inglese': {
      1: `Comprendere semplici domande e istruzioni
        Presentarsi e rispondere a semplici domande
        Scrivere semplici frasi su di sé`,
      2: `Comprendere il senso globale di brevi dialoghi
        Descrivere in modo semplice azioni quotidiane
        Scrivere brevi messaggi guidati`,
      3: `Comprendere le informazioni essenziali di un testo semplice
        Esprimersi su argomenti noti con frasi semplici
        Scrivere un breve testo guidato`
    },
    'Seconda lingua comunitaria': {
      1: `Comprendere semplici saluti e istruzioni
        Presentarsi in modo semplice
        Scrivere semplici frasi guidate`,
      2: `Comprendere il senso globale di brevi dialoghi
        Rispondere a semplici domande
        Scrivere brevi frasi guidate`,
      3: `Comprendere le informazioni essenziali di brevi testi
        Esprimersi su argomenti noti con frasi semplici
        Scrivere un breve testo guidato`
    },
    'Tecnologia': {
      1: `Usare correttamente gli strumenti del disegno
        Conoscere le principali proprietà dei materiali
        Eseguire semplici costruzioni geometriche`,
      2: `Eseguire semplici proiezioni ortogonali
        Conoscere i principi nutritivi fondamentali
        Usare il computer per semplici elaborati`,
      3: `Conoscere le principali fonti di energia
        Eseguire semplici assonometrie
        Usare la rete in modo sicuro`
    },
    'Musica': {
      1: `Eseguire in gruppo semplici brani
        Riconoscere i principali strumenti musicali
        Leggere e scrivere brevi e semplici sequenze ritmico-melodiche
        Riconoscere e analizzare in maniera essenziale i suoni in base ai quattro parametri`,
      2: `Leggere semplici brani con i segni studiati
        Riconoscere i principali strumenti e stili musicali
        Eseguire semplici accompagnamenti ritmici
        Suonare/cantare semplici brani, anche polifonici`,
      3: `Leggere semplici brani con i segni studiati
        Riconoscere i principali strumenti, stili e forme musicali
        Eseguire semplici accompagnamenti ritmici
        Suonare/cantare semplici brani, anche polifonici
        Comprendere in modo essenziale la relazione tra musica ed eventi storici`
    },
    'Arte e immagine': {
      1: `Usare in modo semplice le tecniche grafiche
        Riconoscere gli elementi di base del linguaggio visivo
        Conoscere le principali opere studiate`,
      2: `Rappresentare semplici spazi in prospettiva
        Usare tempere e acquerelli in modo semplice
        Riconoscere le principali opere studiate`,
      3: `Realizzare semplici elaborati personali
        Riconoscere i principali movimenti artistici studiati
        Descrivere in modo semplice un'opera d'arte`
    },
    'Educazione fisica': {
      1: `Eseguire gli schemi motori di base
        Partecipare ai giochi rispettando le regole
        Rispettare le norme di sicurezza`,
      2: `Eseguire i fondamentali di base dei giochi sportivi
        Rispettare regole e compagni
        Eseguire un riscaldamento guidato`,
      3: `Partecipare attivamente alle attività sportive
        Rispettare le regole del gioco
        Conoscere le principali norme per la salute`
    },
    'Religione cattolica': {
      1: `Conoscere la struttura della Bibbia
        Conoscere i fatti essenziali della vita di Gesù`,
      2: `Conoscere le tappe essenziali della storia della Chiesa
        Riconoscere i sacramenti`,
      3: `Conoscere gli elementi essenziali delle grandi religioni
        Riflettere in modo semplice su un tema etico`
    }
  };

  var api = { obiettivi: OBIETTIVI, obiettiviMinimi: MINIMI };
  root.PDL = root.PDL || {};
  root.PDL.obiettivi = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
