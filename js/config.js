/*
 * Configurazione del sito: accesso con Google e modelli delle scuole.
 *
 * Chi accede con un account Google Workspace di una scuola elencata qui
 * riceve automaticamente il modello di quella scuola, in sola lettura;
 * solo i referenti indicati possono modificarlo.
 * Il controllo avviene nel browser (il sito non ha un server): serve a
 * guidare i docenti, non a proteggere dati riservati.
 */
(function (root) {
  'use strict';

  root.PDL = root.PDL || {};
  root.PDL.config = {
    // ID client OAuth di Google (console.cloud.google.com → API e servizi → Credenziali).
    // Vuoto: l'accesso con Google è disattivato.
    googleClientId: '',

    // Modello caricato per chi non accede con Google. Vuoto: modello predefinito dell'app.
    // Quando l'accesso è attivo va lasciato vuoto, così ogni scuola riceve solo il proprio.
    modelloPubblico: 'scuole/ic-almese.json',

    // Una voce per scuola: dominio Google Workspace degli account dei docenti,
    // file del modello (nella cartella scuole/) ed e-mail dei referenti.
    scuole: [
      {
        dominio: 'comprensivoalmese.it',
        nome: 'Istituto Comprensivo di Almese',
        modello: 'scuole/ic-almese.json',
        referenti: [
          'andrea.giorda@comprensivoalmese.it',
          'camilla.cantore@comprensivoalmese.it',
          'chiara.leto@comprensivoalmese.it',
          'alessandro.trino@comprensivoalmese.it'
        ]
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
