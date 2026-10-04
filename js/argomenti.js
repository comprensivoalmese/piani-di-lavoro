/*
 * Argomenti proposti per ogni disciplina e classe (prima, seconda, terza).
 * Sono un punto di partenza: il referente li adatta al curricolo d'istituto
 * dalla sezione "Modello d'istituto". Formato: una voce per riga, le righe
 * che finiscono con ":" sono i titoli dei gruppi.
 */
(function (root) {
  'use strict';

  var ARGOMENTI = {
    'Italiano': {
      1: `Grammatica:
        Fonologia e ortografia
        La punteggiatura
        Il nome e l'articolo
        L'aggettivo
        Il pronome
        Il verbo: modi, tempi e coniugazioni
        Avverbio, preposizione, congiunzione e interiezione
        Il lessico e l'uso del dizionario
        Antologia e tipologie testuali:
        Il testo narrativo: struttura e sequenze
        La fiaba e la favola
        Il racconto d'avventura e il fantasy
        Il testo descrittivo
        Il testo regolativo
        La poesia: verso, rima, strofa e figure retoriche
        Epica:
        Il mito
        L'Iliade
        L'Odissea
        L'Eneide
        L'epica medievale: ciclo carolingio e ciclo bretone
        Scrittura:
        Il riassunto
        La parafrasi
        Il testo narrativo e descrittivo
        Ascolto e parlato:
        Ascolto attivo e presa di appunti
        L'esposizione orale di esperienze e argomenti di studio`,
      2: `Grammatica:
        La frase semplice: soggetto e predicato
        L'attributo e l'apposizione
        Il complemento oggetto
        I complementi indiretti
        Ripasso della morfologia
        Antologia e tipologie testuali:
        Il testo autobiografico: diario, lettera, autobiografia
        Il racconto fantastico, horror, giallo e umoristico
        Il testo espositivo
        La poesia: temi e figure retoriche
        Il testo teatrale
        Letteratura italiana:
        Le origini della lingua italiana
        La poesia del Duecento: Scuola siciliana, poesia religiosa, Dolce stil novo
        Dante Alighieri e la Divina Commedia
        Petrarca e Boccaccio
        Umanesimo e Rinascimento
        Dal Seicento al Settecento: Galileo, Goldoni, Parini
        Scrittura:
        La lettera e il diario
        Il testo espositivo
        Il riassunto e la parafrasi
        Ascolto e parlato:
        L'esposizione orale con scalette e mappe
        La discussione e il confronto di opinioni`,
      3: `Grammatica:
        Il periodo: proposizioni principali, coordinate e subordinate
        Le proposizioni subordinate
        Ripasso dell'analisi logica
        Storia della lingua e lessico specialistico
        Antologia e tipologie testuali:
        Il testo argomentativo
        Il romanzo e la novella
        Il testo informativo e l'articolo di giornale
        Temi di attualità: adolescenza, legalità, guerra e pace, ambiente
        Orientamento: conoscere sé stessi e scegliere
        Letteratura italiana:
        Neoclassicismo e Romanticismo: Foscolo, Leopardi, Manzoni
        Il Verismo e Giovanni Verga
        Il Decadentismo: Pascoli e D'Annunzio
        La poesia del Novecento: Ungaretti, Montale, Saba, Quasimodo
        La narrativa del Novecento: Pirandello, Svevo, Calvino, Levi
        Scrittura:
        Il testo argomentativo
        La relazione
        La prova scritta dell'esame di Stato
        Ascolto e parlato:
        L'esposizione orale con collegamenti (colloquio d'esame)
        Il dibattito`
    },
    'Storia': {
      1: `Dalla caduta dell'Impero romano all'Alto Medioevo:
        Gli strumenti dello storico: fonti e cronologia
        La crisi dell'Impero romano e le invasioni barbariche
        L'Impero bizantino
        I Longobardi in Italia
        Maometto e l'espansione dell'Islam
        Carlo Magno e il Sacro Romano Impero
        Il feudalesimo
        Il Basso Medioevo:
        La rinascita dopo il Mille
        Chiesa e Impero: la lotta per le investiture
        Le Crociate
        I Comuni
        Federico Barbarossa e Federico II
        La crisi del Trecento e la peste
        Signorie e Stati regionali in Italia
        Le monarchie nazionali`,
      2: `L'età moderna:
        Umanesimo e Rinascimento
        Le scoperte geografiche
        La Riforma protestante e la Controriforma
        Carlo V e le guerre d'Italia
        L'Europa del Seicento: guerre di religione e assolutismo
        La rivoluzione scientifica
        Il Settecento:
        L'Illuminismo
        La rivoluzione industriale
        La rivoluzione americana
        La Rivoluzione francese
        Napoleone Bonaparte
        L'Ottocento:
        Il Congresso di Vienna e la Restaurazione
        I moti liberali
        Il Risorgimento e l'Unità d'Italia`,
      3: `L'Ottocento:
        L'Italia dopo l'Unità
        La seconda rivoluzione industriale
        Colonialismo e imperialismo
        Il Novecento:
        La Belle Époque e l'età giolittiana
        La Prima guerra mondiale
        La Rivoluzione russa
        I totalitarismi: fascismo, nazismo, stalinismo
        La crisi del 1929
        La Seconda guerra mondiale e la Shoah
        La Resistenza e la nascita della Repubblica italiana
        Il mondo contemporaneo:
        La guerra fredda
        La decolonizzazione
        La nascita dell'Unione europea
        L'Italia repubblicana
        La globalizzazione e i problemi del mondo attuale`
    },
    'Geografia': {
      1: `Gli strumenti della geografia:
        L'orientamento e i punti cardinali
        Le carte geografiche e la scala
        Grafici, tabelle e dati statistici
        L'ambiente fisico:
        Il clima
        Rilievi, pianure, fiumi, laghi, mari e coste
        Gli ambienti naturali italiani ed europei
        L'Italia:
        La popolazione e le città
        I settori economici
        Le regioni italiane`,
      2: `L'Europa:
        Il territorio europeo: morfologia e clima
        La popolazione e le lingue
        L'Unione europea: storia e istituzioni
        L'economia europea
        Gli Stati europei:
        La regione iberica
        La Francia e il Benelux
        La regione germanica
        Le isole britanniche
        La regione scandinava
        L'Europa centro-orientale
        La regione balcanica
        La Russia`,
      3: `Il mondo:
        Il pianeta Terra: continenti, oceani, fasce climatiche
        Gli ambienti naturali e i biomi
        Popolazione, migrazioni e urbanizzazione
        Sviluppo e sottosviluppo
        La globalizzazione
        Lo sviluppo sostenibile e l'Agenda 2030
        I continenti extraeuropei:
        L'Asia
        L'Africa
        L'America settentrionale
        L'America centrale e meridionale
        L'Oceania e l'Antartide`
    },
    'Matematica': {
      1: `Aritmetica:
        Gli insiemi
        Il sistema di numerazione decimale
        Le quattro operazioni e le loro proprietà
        Le potenze
        Le espressioni
        Multipli, divisori e criteri di divisibilità
        Numeri primi, M.C.D. e m.c.m.
        Le frazioni
        Geometria:
        Gli enti geometrici fondamentali
        Segmenti e angoli
        Le misure e il sistema metrico decimale
        Rette perpendicolari e parallele
        I poligoni
        I triangoli
        I quadrilateri
        Dati e previsioni:
        Raccolta e rappresentazione dei dati`,
      2: `Aritmetica:
        Le operazioni con le frazioni
        I numeri decimali e le frazioni generatrici
        La radice quadrata
        Rapporti e proporzioni
        Grandezze direttamente e inversamente proporzionali
        La percentuale
        Geometria:
        L'equivalenza delle figure piane
        Le aree dei poligoni
        Il teorema di Pitagora
        Le isometrie
        La similitudine e i teoremi di Euclide
        Relazioni e funzioni:
        Il piano cartesiano
        Dati e previsioni:
        Media, moda e mediana`,
      3: `Aritmetica e algebra:
        I numeri relativi
        Il calcolo letterale: monomi e polinomi
        I prodotti notevoli
        Le equazioni di primo grado
        Relazioni e funzioni:
        Le funzioni e la loro rappresentazione
        Proporzionalità diretta e inversa
        La retta nel piano cartesiano
        Geometria:
        Circonferenza e cerchio
        Poligoni inscritti e circoscritti
        Lunghezza della circonferenza e area del cerchio
        Rette e piani nello spazio
        I poliedri: prismi e piramidi
        I solidi di rotazione: cilindro e cono
        Volume e peso specifico
        Dati e previsioni:
        La probabilità
        Statistica e rappresentazione dei dati`
    },
    'Scienze': {
      1: `Il metodo scientifico:
        Il metodo sperimentale
        Grandezze e misure
        La materia:
        La materia e i suoi stati
        Calore e temperatura
        I passaggi di stato
        L'acqua, l'aria e il suolo
        I viventi:
        Le caratteristiche dei viventi
        La cellula
        La classificazione dei viventi
        Microrganismi e funghi
        Le piante
        Gli animali invertebrati e vertebrati
        Gli ecosistemi`,
      2: `Chimica:
        Atomi e molecole
        Elementi e composti
        Le reazioni chimiche
        Acidi, basi e sali
        La chimica del carbonio e le biomolecole
        Fisica:
        Il moto
        Le forze e l'equilibrio
        Le leve
        Il corpo umano:
        L'organizzazione del corpo umano
        L'apparato locomotore
        L'apparato digerente e l'alimentazione
        L'apparato respiratorio
        L'apparato circolatorio
        L'apparato escretore`,
      3: `Il corpo umano:
        Il sistema nervoso e gli organi di senso
        Il sistema endocrino
        L'apparato riproduttore
        Educazione alla salute e dipendenze
        Genetica ed evoluzione:
        Il DNA e la genetica
        Le leggi di Mendel
        L'evoluzione dei viventi
        Scienze della Terra e astronomia:
        La struttura della Terra
        Minerali e rocce
        Vulcani e terremoti
        La tettonica a placche
        Il Sistema solare
        L'Universo
        Fisica:
        Lavoro ed energia
        Elettricità e magnetismo`
    },
    'Lingua inglese': {
      1: `Funzioni comunicative:
        Salutare e presentarsi
        Parlare della famiglia
        Descrivere persone, oggetti e luoghi
        Parlare della routine quotidiana e del tempo libero
        Esprimere gusti e preferenze
        Chiedere e dire l'ora e la data
        Strutture grammaticali:
        Pronomi personali soggetto e aggettivi possessivi
        Il verbo to be
        Il verbo have got
        There is / there are
        Plurale dei nomi, articoli e dimostrativi
        Present simple e avverbi di frequenza
        Can (abilità)
        L'imperativo
        Lessico:
        Numeri, colori, giorni e mesi
        Famiglia, casa e scuola
        Cibo e animali
        Cultura e civiltà:
        Festività e tradizioni dei paesi anglofoni
        Il Regno Unito`,
      2: `Funzioni comunicative:
        Parlare di azioni in corso
        Raccontare eventi passati
        Fare acquisti e chiedere prezzi
        Chiedere e dare indicazioni stradali
        Fare proposte, accettare e rifiutare
        Strutture grammaticali:
        Present continuous
        Past simple dei verbi regolari e irregolari
        Some, any, much, many
        Comparativi e superlativi
        Be going to e present continuous per il futuro
        Must e have to
        Lessico:
        Abbigliamento, negozi e città
        Sport, mezzi di trasporto e vacanze
        Cultura e civiltà:
        Gli Stati Uniti
        Londra e le città del mondo anglofono`,
      3: `Funzioni comunicative:
        Fare previsioni e progetti
        Parlare di esperienze
        Dare consigli
        Esprimere opinioni e argomentare
        Riferire ciò che altri hanno detto
        Strutture grammaticali:
        Past continuous
        Present perfect con ever, never, just, already, yet, for, since
        Il futuro con will
        Il periodo ipotetico
        Should, might, may
        La forma passiva
        I pronomi relativi
        Cultura e civiltà:
        Il mondo anglofono: Australia, Canada, India, Sudafrica
        Temi di attualità: ambiente, tecnologia, diritti
        Preparazione alla prova d'esame e alle prove INVALSI`
    },
    'Seconda lingua comunitaria': {
      1: `Funzioni comunicative:
        Salutare, presentarsi e presentare qualcuno
        Dire nazionalità, età e indirizzo
        Descrivere la famiglia
        Descrivere persone e oggetti
        Parlare della scuola e della giornata
        Strutture grammaticali:
        Alfabeto e pronuncia
        Articoli determinativi e indeterminativi
        Genere e numero di nomi e aggettivi
        Pronomi personali soggetto
        Presente dei verbi essere e avere
        Presente dei verbi regolari
        Forma negativa e interrogativa
        Lessico:
        Numeri, colori, giorni e mesi
        Famiglia, scuola e animali
        Cultura e civiltà:
        Il paese di cui si studia la lingua: geografia e tradizioni`,
      2: `Funzioni comunicative:
        Parlare di abitudini e tempo libero
        Chiedere e dire l'ora
        Fare acquisti
        Chiedere e dare indicazioni
        Invitare, accettare e rifiutare
        Strutture grammaticali:
        Presente dei principali verbi irregolari
        Aggettivi possessivi e dimostrativi
        Preposizioni articolate
        Il futuro prossimo
        L'imperativo
        Il passato prossimo
        Lessico:
        Casa, abbigliamento, cibo e città
        Cultura e civiltà:
        La capitale e le principali città`,
      3: `Funzioni comunicative:
        Raccontare esperienze passate
        Parlare di progetti futuri
        Esprimere opinioni, sensazioni e stati d'animo
        Dare consigli
        Strutture grammaticali:
        Passato prossimo e imperfetto
        Il futuro semplice
        I pronomi complemento
        Comparativi e superlativi
        Il condizionale
        Cultura e civiltà:
        I paesi in cui si parla la lingua nel mondo
        Temi di attualità e cittadinanza
        Preparazione alla prova d'esame`
    },
    'Tecnologia': {
      1: `Disegno tecnico:
        Gli strumenti del disegno
        Le costruzioni geometriche fondamentali
        I poligoni regolari
        Figure modulari e strutture
        Materiali:
        Proprietà dei materiali
        Il legno
        La carta
        Le fibre tessili
        Il vetro e la ceramica
        Tecnologia e ambiente:
        La raccolta differenziata e il riciclo
        Informatica:
        Il computer: hardware e software
        La videoscrittura`,
      2: `Disegno tecnico:
        Le proiezioni ortogonali
        Quote e scale di rappresentazione
        Materiali:
        I metalli
        Le materie plastiche
        Alimentazione e agricoltura:
        I principi nutritivi e la piramide alimentare
        Agricoltura e allevamento
        L'industria alimentare e la conservazione degli alimenti
        Il territorio e l'abitazione:
        La città e l'urbanistica
        La casa: strutture e impianti
        Informatica:
        Il foglio di calcolo
        Le presentazioni multimediali`,
      3: `Disegno tecnico:
        Le assonometrie
        Lo sviluppo dei solidi
        Il disegno al computer (CAD)
        Energia:
        Fonti di energia rinnovabili e non rinnovabili
        Le centrali elettriche
        Risparmio energetico e impatto ambientale
        Elettricità:
        Il circuito elettrico
        Elettricità e magnetismo
        Macchine e motori:
        Le macchine semplici
        I motori
        I mezzi di trasporto
        Informatica:
        Internet e la sicurezza in rete
        Pensiero computazionale e coding`
    },
    'Musica': {
      1: `Acustica:
        La produzione del suono
        La trasmissione del suono
        L'udito
        Le caratteristiche del suono
        Strumenti, voci e orchestra:
        Gli aerofoni
        I cordofoni
        Gli idiofoni
        I membranofoni
        Gli elettrofoni
        Le formazioni strumentali e le voci
        Lettura:
        Il pentagramma
        La chiave, la battuta e il ritornello
        Le figure musicali
        Il tempo
        La dinamica
        L'agogica
        Produzione:
        La semiminima
        La minima
        La croma
        Il ritornello
        Le battute d'aspetto
        La semibreve
        La semicroma`,
      2: `Storia della musica:
        Il Medioevo
        Il Rinascimento
        Il Barocco
        Il Classicismo
        Lettura e produzione:
        Le alterazioni
        Il punto di valore
        La legatura di valore
        Gruppi irregolari: la terzina
        Brani appartenenti a generi e stili diversi, anche polifonici
        Semplici dettati ritmici
        Ostinati e semplici forme di accompagnamento`,
      3: `Storia della musica:
        Il Classicismo
        Il Romanticismo
        Avanguardie e Contemporaneità
        Il Jazz
        La popular music
        Lettura e produzione:
        I tempi composti
        La polifonia
        Le scale musicali
        La formazione degli accordi
        Brani appartenenti a generi e stili diversi, anche polifonici
        Dettati ritmici
        Ostinati e semplici accompagnamenti accordali`
    },
    'Arte e immagine': {
      1: `Linguaggio visivo:
        Il punto, la linea e la superficie
        Il colore: primari, secondari e complementari
        La texture
        Le tecniche grafiche: matite, pastelli, pennarelli
        Storia dell'arte:
        L'arte della Preistoria
        L'arte egizia
        L'arte cretese e micenea
        L'arte greca
        L'arte etrusca e romana
        L'arte paleocristiana e bizantina
        L'arte romanica e gotica`,
      2: `Linguaggio visivo:
        La composizione: simmetria, ritmo ed equilibrio
        Lo spazio e la prospettiva
        Luce e ombra
        Le tecniche pittoriche: tempere e acquerelli
        Storia dell'arte:
        Il primo Rinascimento: Brunelleschi, Donatello, Masaccio
        Il Rinascimento maturo: Leonardo, Michelangelo, Raffaello
        Il Rinascimento a Venezia
        Il Manierismo
        Il Barocco
        Il Settecento: Rococò e Neoclassicismo`,
      3: `Linguaggio visivo:
        La figura umana e il volto
        La comunicazione visiva: fotografia, fumetto, pubblicità, cinema
        Tecniche miste e collage
        Storia dell'arte:
        Romanticismo e Realismo
        L'Impressionismo
        Il Post-impressionismo
        L'Art Nouveau
        Le avanguardie del Novecento
        L'arte del secondo Novecento e contemporanea
        Patrimonio:
        I beni culturali del territorio e la loro tutela`
    },
    'Educazione fisica': {
      1: `Capacità motorie:
        Gli schemi motori di base
        Le capacità coordinative
        Le capacità condizionali: resistenza, forza, velocità, mobilità
        Il gioco e lo sport:
        Giochi di gruppo e giochi presportivi
        La pallavolo: i fondamentali
        Atletica leggera: corsa e salti
        Salute e benessere:
        Il corpo umano e il movimento
        Igiene e corretta alimentazione`,
      2: `Capacità motorie:
        Consolidamento delle capacità coordinative
        Allenamento delle capacità condizionali
        Il gioco e lo sport:
        La pallacanestro: fondamentali e regolamento
        La pallavolo: il gioco di squadra
        Atletica leggera: lanci e staffette
        Giochi della tradizione
        Il fair play e le regole
        Salute e benessere:
        L'apparato locomotore
        Riscaldamento e stretching`,
      3: `Capacità motorie:
        Capacità condizionali e test motori
        Il gioco e lo sport:
        Sport di squadra: tattica e arbitraggio
        Sport individuali e di racchetta
        L'orienteering
        L'espressione corporea
        Salute e benessere:
        Il primo soccorso
        Doping e dipendenze
        Sport, salute e stili di vita
        La storia dello sport e le Olimpiadi`
    },
    'Religione cattolica': {
      1: `La ricerca religiosa:
        L'uomo e le domande di senso
        Le religioni antiche
        La Bibbia:
        La Bibbia: struttura e composizione
        La storia del popolo d'Israele: patriarchi, esodo, re e profeti
        Gesù di Nazareth:
        La Palestina al tempo di Gesù
        Le fonti su Gesù: i Vangeli
        Il messaggio di Gesù: parabole e miracoli
        La Pasqua di Gesù`,
      2: `La Chiesa:
        Le prime comunità cristiane
        Pietro e Paolo
        Le persecuzioni e la diffusione del cristianesimo
        Il monachesimo
        Lo scisma d'Oriente e la Riforma
        La Chiesa oggi: i sacramenti
        Il linguaggio religioso:
        Le festività e l'anno liturgico
        L'arte cristiana`,
      3: `Le religioni nel mondo:
        Ebraismo e Islam
        Induismo e Buddhismo
        Il dialogo interreligioso
        Etica e scelte di vita:
        La coscienza e la libertà
        Il progetto di vita
        L'amore e l'amicizia
        Dignità della persona, diritti umani e pace
        Scienza e fede
        La custodia del creato`
    }
  };

  root.PDL = root.PDL || {};
  root.PDL.argomenti = ARGOMENTI;
  if (typeof module !== 'undefined' && module.exports) module.exports = ARGOMENTI;
})(typeof window !== 'undefined' ? window : globalThis);
