/*
 * Modello d'istituto predefinito.
 * Contiene la struttura del piano di lavoro, gli elenchi di opzioni
 * precompilate e i traguardi per lo sviluppo delle competenze al termine
 * della scuola secondaria di primo grado (Indicazioni nazionali 2012).
 * Tutto è modificabile dalla sezione "Modello d'istituto" dell'app.
 */
(function (root) {
  'use strict';

  function annoScolasticoCorrente(data) {
    var d = data || new Date();
    var y = d.getFullYear();
    // Da agosto in poi si considera il nuovo anno scolastico.
    return d.getMonth() >= 7 ? y + '/' + (y + 1) : (y - 1) + '/' + y;
  }

  var NUCLEI_LINGUE = [
    'Ascolto (comprensione orale)',
    'Parlato (produzione e interazione orale)',
    'Lettura (comprensione scritta)',
    'Scrittura (produzione scritta)',
    'Riflessione sulla lingua e sull\'apprendimento'
  ];

  var DISCIPLINE = [
    {
      nome: 'Italiano',
      ore: 6,
      nuclei: [
        'Ascolto e parlato',
        'Lettura',
        'Scrittura',
        'Acquisizione ed espansione del lessico ricettivo e produttivo',
        'Elementi di grammatica esplicita e riflessione sugli usi della lingua'
      ],
      traguardi: [
        'L\'allievo interagisce in modo efficace in diverse situazioni comunicative, attraverso modalità dialogiche sempre rispettose delle idee degli altri; utilizza il dialogo per apprendere informazioni ed elaborare opinioni su problemi riguardanti vari ambiti culturali e sociali.',
        'Usa la comunicazione orale per collaborare con gli altri, ad esempio nella realizzazione di giochi o prodotti, nell\'elaborazione di progetti e nella formulazione di giudizi su problemi riguardanti vari ambiti culturali e sociali.',
        'Ascolta e comprende testi di vario tipo "diretti" e "trasmessi" dai media, riconoscendone la fonte, il tema, le informazioni e la loro gerarchia, l\'intenzione dell\'emittente.',
        'Espone oralmente all\'insegnante e ai compagni argomenti di studio e di ricerca, anche avvalendosi di supporti specifici (schemi, mappe, presentazioni al computer, ecc.).',
        'Usa manuali delle discipline o testi divulgativi (continui, non continui e misti) nelle attività di studio personali e collaborative, per ricercare, raccogliere e rielaborare dati, informazioni e concetti.',
        'Legge testi letterari di vario tipo (narrativi, poetici, teatrali) e comincia a costruirne un\'interpretazione, collaborando con compagni e insegnanti.',
        'Scrive correttamente testi di tipo diverso (narrativo, descrittivo, espositivo, regolativo, argomentativo) adeguati a situazione, argomento, scopo, destinatario.',
        'Produce testi multimediali, utilizzando in modo efficace l\'accostamento dei linguaggi verbali con quelli iconici e sonori.',
        'Comprende e usa in modo appropriato le parole del vocabolario di base (fondamentale; di alto uso; di alta disponibilità).',
        'Riconosce e usa termini specialistici in base ai campi di discorso.',
        'Adatta opportunamente i registri informale e formale in base alla situazione comunicativa e agli interlocutori, realizzando scelte lessicali adeguate.',
        'Riconosce il rapporto tra varietà linguistiche/lingue diverse (plurilinguismo) e il loro uso nello spazio geografico, sociale e comunicativo.',
        'Padroneggia e applica in situazioni diverse le conoscenze fondamentali relative al lessico, alla morfologia, all\'organizzazione logico-sintattica della frase semplice e complessa, ai connettivi testuali; utilizza le conoscenze metalinguistiche per comprendere i significati dei testi e per correggere i propri scritti.'
      ]
    },
    {
      nome: 'Storia',
      ore: 2,
      nuclei: [
        'Uso delle fonti',
        'Organizzazione delle informazioni',
        'Strumenti concettuali',
        'Produzione scritta e orale'
      ],
      traguardi: [
        'L\'alunno si informa in modo autonomo su fatti e problemi storici anche mediante l\'uso di risorse digitali.',
        'Produce informazioni storiche con fonti di vario genere, anche digitali, e le sa organizzare in testi.',
        'Comprende testi storici e li sa rielaborare con un personale metodo di studio.',
        'Espone oralmente e con scritture, anche digitali, le conoscenze storiche acquisite operando collegamenti e argomentando le proprie riflessioni.',
        'Usa le conoscenze e le abilità per orientarsi nella complessità del presente, comprende opinioni e culture diverse, capisce i problemi fondamentali del mondo contemporaneo.',
        'Comprende aspetti, processi e avvenimenti fondamentali della storia italiana dalle forme di insediamento e di potere medievali alla formazione dello stato unitario fino alla nascita della Repubblica.',
        'Conosce aspetti e processi fondamentali della storia europea medievale, moderna e contemporanea.',
        'Conosce aspetti e processi fondamentali della storia mondiale, dalla civilizzazione neolitica alla rivoluzione industriale, alla globalizzazione.',
        'Conosce aspetti e processi essenziali della storia del suo ambiente.',
        'Conosce aspetti del patrimonio culturale, italiano e dell\'umanità, e li sa mettere in relazione con i fenomeni storici studiati.'
      ]
    },
    {
      nome: 'Geografia',
      ore: 2,
      nuclei: [
        'Orientamento',
        'Linguaggio della geo-graficità',
        'Paesaggio',
        'Regione e sistema territoriale'
      ],
      traguardi: [
        'Lo studente si orienta nello spazio e sulle carte di diversa scala in base ai punti cardinali e alle coordinate geografiche; sa orientare una carta geografica a grande scala facendo ricorso a punti di riferimento fissi.',
        'Utilizza opportunamente carte geografiche, fotografie attuali e d\'epoca, immagini da telerilevamento, elaborazioni digitali, grafici, dati statistici, sistemi informativi geografici per comunicare efficacemente informazioni spaziali.',
        'Riconosce nei paesaggi europei e mondiali, raffrontandoli in particolare a quelli italiani, gli elementi fisici significativi e le emergenze storiche, artistiche e architettoniche, come patrimonio naturale e culturale da tutelare e valorizzare.',
        'Osserva, legge e analizza sistemi territoriali vicini e lontani, nello spazio e nel tempo, e valuta gli effetti di azioni dell\'uomo sui sistemi territoriali alle diverse scale geografiche.'
      ]
    },
    {
      nome: 'Matematica',
      ore: 4,
      nuclei: ['Numeri', 'Spazio e figure', 'Relazioni e funzioni', 'Dati e previsioni'],
      traguardi: [
        'L\'alunno si muove con sicurezza nel calcolo anche con i numeri razionali, ne padroneggia le diverse rappresentazioni e stima la grandezza di un numero e il risultato di operazioni.',
        'Riconosce e denomina le forme del piano e dello spazio, le loro rappresentazioni e ne coglie le relazioni tra gli elementi.',
        'Analizza e interpreta rappresentazioni di dati per ricavarne misure di variabilità e prendere decisioni.',
        'Riconosce e risolve problemi in contesti diversi valutando le informazioni e la loro coerenza.',
        'Spiega il procedimento seguito, anche in forma scritta, mantenendo il controllo sia sul processo risolutivo, sia sui risultati.',
        'Confronta procedimenti diversi e produce formalizzazioni che gli consentono di passare da un problema specifico a una classe di problemi.',
        'Produce argomentazioni in base alle conoscenze teoriche acquisite (ad esempio sa utilizzare i concetti di proprietà caratterizzante e di definizione).',
        'Sostiene le proprie convinzioni, portando esempi e controesempi adeguati e utilizzando concatenazioni di affermazioni; accetta di cambiare opinione riconoscendo le conseguenze logiche di una argomentazione corretta.',
        'Utilizza e interpreta il linguaggio matematico (piano cartesiano, formule, equazioni...) e ne coglie il rapporto con il linguaggio naturale.',
        'Nelle situazioni di incertezza (vita quotidiana, giochi...) si orienta con valutazioni di probabilità.',
        'Ha rafforzato un atteggiamento positivo rispetto alla matematica attraverso esperienze significative e ha capito come gli strumenti matematici appresi siano utili in molte situazioni per operare nella realtà.'
      ]
    },
    {
      nome: 'Scienze',
      ore: 2,
      nuclei: ['Fisica e chimica', 'Astronomia e Scienze della Terra', 'Biologia'],
      traguardi: [
        'L\'alunno esplora e sperimenta, in laboratorio e all\'aperto, lo svolgersi dei più comuni fenomeni, ne immagina e ne verifica le cause; ricerca soluzioni ai problemi, utilizzando le conoscenze acquisite.',
        'Sviluppa semplici schematizzazioni e modellizzazioni di fatti e fenomeni ricorrendo, quando è il caso, a misure appropriate e a semplici formalizzazioni.',
        'Riconosce nel proprio organismo strutture e funzionamenti a livelli macroscopici e microscopici, è consapevole delle sue potenzialità e dei suoi limiti.',
        'Ha una visione della complessità del sistema dei viventi e della sua evoluzione nel tempo; riconosce nella loro diversità i bisogni fondamentali di animali e piante, e i modi di soddisfarli negli specifici contesti ambientali.',
        'È consapevole del ruolo della comunità umana sulla Terra, del carattere finito delle risorse, nonché dell\'ineguaglianza dell\'accesso a esse, e adotta modi di vita ecologicamente responsabili.',
        'Collega lo sviluppo delle scienze allo sviluppo della storia dell\'uomo.',
        'Ha curiosità e interesse verso i principali problemi legati all\'uso della scienza nel campo dello sviluppo scientifico e tecnologico.'
      ]
    },
    {
      nome: 'Lingua inglese',
      ore: 3,
      nuclei: NUCLEI_LINGUE.slice(),
      traguardi: [
        'L\'alunno comprende oralmente e per iscritto i punti essenziali di testi in lingua standard su argomenti familiari o di studio che affronta normalmente a scuola e nel tempo libero.',
        'Descrive oralmente situazioni, racconta avvenimenti ed esperienze personali, espone argomenti di studio.',
        'Interagisce con uno o più interlocutori in contesti familiari e su argomenti noti.',
        'Legge semplici testi con diverse strategie adeguate allo scopo.',
        'Legge testi informativi e ascolta spiegazioni attinenti a contenuti di studio di altre discipline.',
        'Scrive semplici resoconti e compone brevi lettere o messaggi rivolti a coetanei e familiari.',
        'Individua elementi culturali veicolati dalla lingua materna o di scolarizzazione e li confronta con quelli veicolati dalla lingua straniera, senza atteggiamenti di rifiuto.',
        'Affronta situazioni nuove attingendo al suo repertorio linguistico; usa la lingua per apprendere argomenti anche di ambiti disciplinari diversi e collabora fattivamente con i compagni nella realizzazione di attività e progetti.',
        'Autovaluta le competenze acquisite ed è consapevole del proprio modo di apprendere.'
      ]
    },
    {
      nome: 'Seconda lingua comunitaria',
      ore: 2,
      nuclei: NUCLEI_LINGUE.slice(),
      traguardi: [
        'L\'alunno comprende brevi messaggi orali e scritti relativi ad ambiti familiari.',
        'Comunica oralmente in attività che richiedono solo uno scambio di informazioni semplice e diretto su argomenti familiari e abituali.',
        'Descrive oralmente e per iscritto, in modo semplice, aspetti del proprio vissuto e del proprio ambiente.',
        'Legge brevi e semplici testi con tecniche adeguate allo scopo.',
        'Chiede spiegazioni, svolge i compiti secondo le indicazioni date in lingua straniera dall\'insegnante.',
        'Stabilisce relazioni tra semplici elementi linguistico-comunicativi e culturali propri delle lingue di studio.',
        'Confronta i risultati conseguiti in lingue diverse e le strategie utilizzate per imparare.'
      ]
    },
    {
      nome: 'Tecnologia',
      ore: 2,
      nuclei: [
        'Vedere, osservare e sperimentare',
        'Prevedere, immaginare e progettare',
        'Intervenire, trasformare e produrre'
      ],
      traguardi: [
        'L\'alunno riconosce nell\'ambiente che lo circonda i principali sistemi tecnologici e le molteplici relazioni che essi stabiliscono con gli esseri viventi e gli altri elementi naturali.',
        'Conosce i principali processi di trasformazione di risorse o di produzione di beni e riconosce le diverse forme di energia coinvolte.',
        'È in grado di ipotizzare le possibili conseguenze di una decisione o di una scelta di tipo tecnologico, riconoscendo in ogni innovazione opportunità e rischi.',
        'Conosce e utilizza oggetti, strumenti e macchine di uso comune ed è in grado di classificarli e di descriverne la funzione in relazione alla forma, alla struttura e ai materiali.',
        'Utilizza adeguate risorse materiali, informative e organizzative per la progettazione e la realizzazione di semplici prodotti, anche di tipo digitale.',
        'Ricava dalla lettura e dall\'analisi di testi o tabelle informazioni sui beni o sui servizi disponibili sul mercato, in modo da esprimere valutazioni rispetto a criteri di tipo diverso.',
        'Conosce le proprietà e le caratteristiche dei diversi mezzi di comunicazione ed è in grado di farne un uso efficace e responsabile rispetto alle proprie necessità di studio e socializzazione.',
        'Sa utilizzare comunicazioni procedurali e istruzioni tecniche per eseguire, in maniera metodica e razionale, compiti operativi complessi, anche collaborando e cooperando con i compagni.',
        'Progetta e realizza rappresentazioni grafiche o infografiche, relative alla struttura e al funzionamento di sistemi materiali o immateriali, utilizzando elementi del disegno tecnico o altri linguaggi multimediali e di programmazione.'
      ]
    },
    {
      nome: 'Musica',
      ore: 2,
      nuclei: [
        'Esecuzione vocale e strumentale',
        'Ascolto, analisi e comprensione',
        'Linguaggio e notazione musicale',
        'Produzione e rielaborazione creativa'
      ],
      traguardi: [
        'L\'alunno partecipa in modo attivo alla realizzazione di esperienze musicali attraverso l\'esecuzione e l\'interpretazione di brani strumentali e vocali appartenenti a generi e culture differenti.',
        'Usa diversi sistemi di notazione funzionali alla lettura, all\'analisi e alla produzione di brani musicali.',
        'È in grado di ideare e realizzare, anche attraverso l\'improvvisazione o partecipando a processi di elaborazione collettiva, messaggi musicali e multimediali, nel confronto critico con modelli appartenenti al patrimonio musicale, utilizzando anche sistemi informatici.',
        'Comprende e valuta eventi, materiali, opere musicali riconoscendone i significati, anche in relazione alla propria esperienza musicale e ai diversi contesti storico-culturali.',
        'Integra con altri saperi e altre pratiche artistiche le proprie esperienze musicali, servendosi anche di appropriati codici e sistemi di codifica.'
      ]
    },
    {
      nome: 'Arte e immagine',
      ore: 2,
      nuclei: [
        'Esprimersi e comunicare',
        'Osservare e leggere le immagini',
        'Comprendere e apprezzare le opere d\'arte'
      ],
      traguardi: [
        'L\'alunno realizza elaborati personali e creativi sulla base di un\'ideazione e progettazione originale, applicando le conoscenze e le regole del linguaggio visivo, scegliendo in modo funzionale tecniche e materiali differenti anche con l\'integrazione di più media e codici espressivi.',
        'Padroneggia gli elementi principali del linguaggio visivo, legge e comprende i significati di immagini statiche e in movimento, di filmati audiovisivi e di prodotti multimediali.',
        'Legge le opere più significative prodotte nell\'arte antica, medievale, moderna e contemporanea, sapendole collocare nei rispettivi contesti storici, culturali e ambientali; riconosce il valore culturale di immagini, di opere e di oggetti artigianali prodotti in paesi diversi dal proprio.',
        'Riconosce gli elementi principali del patrimonio culturale, artistico e ambientale del proprio territorio ed è sensibile ai problemi della sua tutela e conservazione.',
        'Analizza e descrive beni culturali, immagini statiche e multimediali, utilizzando il linguaggio appropriato.'
      ]
    },
    {
      nome: 'Educazione fisica',
      ore: 2,
      nuclei: [
        'Il corpo e la sua relazione con lo spazio e il tempo',
        'Il linguaggio del corpo come modalità comunicativo-espressiva',
        'Il gioco, lo sport, le regole e il fair play',
        'Salute e benessere, prevenzione e sicurezza'
      ],
      traguardi: [
        'L\'alunno è consapevole delle proprie competenze motorie sia nei punti di forza che nei limiti.',
        'Utilizza le abilità motorie e sportive acquisite adattando il movimento in situazione.',
        'Utilizza gli aspetti comunicativo-relazionali del linguaggio motorio per entrare in relazione con gli altri, praticando attivamente i valori sportivi (fair play) come modalità di relazione quotidiana e di rispetto delle regole.',
        'Riconosce, ricerca e applica a se stesso comportamenti di promozione dello "star bene" in ordine a un sano stile di vita e alla prevenzione.',
        'Rispetta criteri base di sicurezza per sé e per gli altri.',
        'È capace di integrarsi nel gruppo, di assumersi responsabilità e di impegnarsi per il bene comune.'
      ]
    },
    {
      nome: 'Religione cattolica',
      ore: 1,
      nuclei: ['Dio e l\'uomo', 'La Bibbia e le altre fonti', 'Il linguaggio religioso', 'I valori etici e religiosi'],
      traguardi: [
        'L\'alunno è aperto alla sincera ricerca della verità e sa interrogarsi sul trascendente e porsi domande di senso, cogliendo l\'intreccio tra dimensione religiosa e culturale; sa interagire con persone di religione differente, sviluppando un\'identità capace di accoglienza, confronto e dialogo.',
        'Individua, a partire dalla Bibbia, le tappe essenziali e i dati oggettivi della storia della salvezza, della vita e dell\'insegnamento di Gesù, del cristianesimo delle origini; ricostruisce gli elementi fondamentali della storia della Chiesa e li confronta con le vicende della storia civile.',
        'Riconosce i linguaggi espressivi della fede (simboli, preghiere, riti, ecc.), ne individua le tracce presenti in ambito locale, italiano, europeo e nel mondo imparando ad apprezzarli dal punto di vista artistico, culturale e spirituale.',
        'Coglie le implicazioni etiche della fede cristiana e le rende oggetto di riflessione in vista di scelte di vita progettuali e responsabili; impara a dare valore ai propri comportamenti, per relazionarsi in maniera armoniosa con se stesso, con gli altri, con il mondo che lo circonda.'
      ]
    }
  ];

  var SEZIONI = [
    {
      id: 'dati',
      tipo: 'dati',
      titolo: 'Dati generali',
      attiva: true,
      guida: 'Docente, disciplina, classe e sezione compaiono nell\'intestazione del documento.'
    },
    {
      id: 'situazione',
      tipo: 'situazione',
      titolo: 'Analisi della situazione di partenza',
      attiva: true,
      guida: 'Composizione della classe, fasce di livello rilevate e strumenti utilizzati.',
      opzioni: [
        'Test d\'ingresso',
        'Osservazioni sistematiche',
        'Prove oggettive',
        'Colloqui con gli alunni',
        'Informazioni dei docenti dell\'anno precedente / della scuola primaria',
        'Colloqui con le famiglie',
        'Documentazione agli atti (PDP, PEI, certificazioni)'
      ],
      testo: ''
    },
    {
      id: 'competenze',
      tipo: 'checklist',
      titolo: 'Competenze chiave europee',
      attiva: true,
      guida: 'Raccomandazione del Consiglio dell\'Unione europea del 22 maggio 2018.',
      opzioni: [
        'Competenza alfabetica funzionale',
        'Competenza multilinguistica',
        'Competenza matematica e competenza in scienze, tecnologie e ingegneria',
        'Competenza digitale',
        'Competenza personale, sociale e capacità di imparare a imparare',
        'Competenza in materia di cittadinanza',
        'Competenza imprenditoriale',
        'Competenza in materia di consapevolezza ed espressione culturali'
      ],
      testo: ''
    },
    {
      id: 'traguardi',
      tipo: 'traguardi',
      titolo: 'Traguardi per lo sviluppo delle competenze',
      attiva: true,
      guida: 'Indicazioni nazionali per il curricolo (2012): traguardi al termine della scuola secondaria di primo grado. L\'elenco cambia in base alla disciplina scelta.'
    },
    {
      id: 'uda',
      tipo: 'uda',
      titolo: 'Unità di apprendimento: obiettivi, contenuti e tempi',
      attiva: true,
      guida: 'Una riga per ogni unità di apprendimento. I nuclei tematici dipendono dalla disciplina.'
    },
    {
      id: 'metodologie',
      tipo: 'checklist',
      titolo: 'Metodologie didattiche',
      attiva: true,
      opzioni: [
        'Lezione frontale',
        'Lezione partecipata e dialogata',
        'Cooperative learning',
        'Lavori di gruppo',
        'Peer tutoring / peer education',
        'Flipped classroom',
        'Didattica laboratoriale',
        'Problem solving',
        'Brainstorming',
        'Role playing',
        'Debate',
        'Circle time',
        'Apprendimento per scoperta',
        'Compiti di realtà',
        'Didattica digitale integrata',
        'CLIL',
        'Mappe concettuali e schemi',
        'Uscite didattiche e visite guidate'
      ],
      testo: ''
    },
    {
      id: 'strumenti',
      tipo: 'checklist',
      titolo: 'Strumenti e sussidi',
      attiva: true,
      opzioni: [
        'Libro di testo (anche in versione digitale)',
        'Testi di consultazione e letture integrative',
        'Schede e materiali predisposti dal docente',
        'LIM / monitor interattivo',
        'Computer e tablet',
        'Piattaforme e ambienti digitali di apprendimento',
        'Audiovisivi e materiali multimediali',
        'Laboratori',
        'Palestra e attrezzature sportive',
        'Dizionari',
        'Software didattici',
        'Strumenti musicali',
        'Materiale da disegno'
      ],
      testo: ''
    },
    {
      id: 'verifiche',
      tipo: 'checklist',
      titolo: 'Verifiche',
      attiva: true,
      opzioni: [
        'Prove scritte strutturate e semistrutturate',
        'Prove scritte aperte (testi, relazioni, riassunti)',
        'Interrogazioni e colloqui orali',
        'Esercizi e problemi',
        'Prove pratiche e grafiche',
        'Test motori',
        'Questionari',
        'Compiti di realtà',
        'Presentazioni e prodotti multimediali',
        'Relazioni di laboratorio',
        'Osservazioni sistematiche',
        'Autovalutazione'
      ],
      campi: [
        { id: 'scritte', etichetta: 'N. minimo di verifiche scritte per periodo', tipo: 'numero' },
        { id: 'orali', etichetta: 'N. minimo di verifiche orali per periodo', tipo: 'numero' },
        { id: 'pratiche', etichetta: 'N. minimo di verifiche pratiche per periodo', tipo: 'numero' }
      ],
      testo: ''
    },
    {
      id: 'valutazione',
      tipo: 'checklist',
      titolo: 'Criteri di valutazione',
      attiva: true,
      guida: 'Elementi che concorrono alla valutazione periodica e finale.',
      opzioni: [
        'Esiti delle prove di verifica',
        'Livello di partenza e progressi compiuti',
        'Impegno e partecipazione',
        'Metodo di studio e autonomia',
        'Rispetto delle consegne',
        'Interesse e attenzione',
        'Capacità di collaborazione'
      ],
      testo: 'La valutazione, espressa in decimi ai sensi del D.Lgs. 62/2017, ha finalità formativa e sarà coerente con i criteri e le griglie deliberati dal Collegio dei docenti e riportati nel PTOF.'
    },
    {
      id: 'recupero',
      tipo: 'checklist',
      titolo: 'Recupero, consolidamento e potenziamento',
      attiva: true,
      opzioni: [
        'Recupero in itinere',
        'Pausa didattica',
        'Attività per gruppi di livello',
        'Esercitazioni guidate',
        'Lavoro individualizzato',
        'Peer tutoring',
        'Corsi o sportelli di recupero',
        'Attività di approfondimento',
        'Lavori di ricerca individuali o di gruppo',
        'Partecipazione a gare e concorsi',
        'Progetti di potenziamento'
      ],
      testo: ''
    },
    {
      id: 'inclusione',
      tipo: 'checklist',
      titolo: 'Inclusione (alunni con BES, DSA e disabilità)',
      attiva: true,
      opzioni: [
        'Applicazione di quanto previsto nel PEI (L. 104/1992)',
        'Applicazione di quanto previsto nel PDP (L. 170/2010 e BES)',
        'Strumenti compensativi',
        'Misure dispensative',
        'Tempi più lunghi per lo svolgimento delle prove',
        'Verifiche semplificate o equipollenti',
        'Materiali semplificati, mappe e schemi',
        'Tutoraggio tra pari',
        'Collaborazione con il docente di sostegno',
        'Tecnologie assistive',
        'Attività di alfabetizzazione in italiano L2'
      ],
      testo: ''
    },
    {
      id: 'edcivica',
      tipo: 'checklist',
      titolo: 'Educazione civica',
      attiva: true,
      guida: 'Contributo della disciplina al curricolo di educazione civica (L. 92/2019, Linee guida 2024).',
      opzioni: [
        'Costituzione',
        'Sviluppo economico e sostenibilità',
        'Cittadinanza digitale'
      ],
      campi: [
        { id: 'ore', etichetta: 'Ore annuali svolte nella disciplina', tipo: 'numero' },
        { id: 'periodo', etichetta: 'Periodo di svolgimento', tipo: 'testo' }
      ],
      testo: ''
    },
    {
      id: 'famiglie',
      tipo: 'checklist',
      titolo: 'Rapporti con le famiglie',
      attiva: true,
      opzioni: [
        'Colloqui individuali in orario di ricevimento',
        'Colloqui generali',
        'Registro elettronico',
        'Comunicazioni scritte',
        'Incontri su richiesta'
      ],
      testo: ''
    },
    {
      id: 'note',
      tipo: 'testo',
      titolo: 'Osservazioni',
      attiva: true,
      facoltativa: true,
      testo: ''
    }
  ];

  function modelloPredefinito() {
    return {
      schema: 1,
      aggiornato: '',
      bloccato: false,
      scuola: {
        nome: '',
        sottotitolo: 'Scuola secondaria di primo grado',
        citta: '',
        annoScolastico: annoScolasticoCorrente()
      },
      periodi: ['I quadrimestre', 'II quadrimestre'],
      livelli: ['Avanzato', 'Intermedio', 'Base', 'Iniziale'],
      sezioni: JSON.parse(JSON.stringify(SEZIONI)),
      discipline: JSON.parse(JSON.stringify(DISCIPLINE))
    };
  }

  var api = {
    modelloPredefinito: modelloPredefinito,
    annoScolasticoCorrente: annoScolasticoCorrente,
    TIPI_SEZIONE: ['dati', 'situazione', 'checklist', 'traguardi', 'uda', 'testo']
  };

  root.PDL = root.PDL || {};
  root.PDL.defaults = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
