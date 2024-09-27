
# Descrizione di progetto2

## 1. `server.js`
**Descrizione**: File che contiene il primo programma costantemente in esecuzione tramite pm2, contenuto nella cartella `progetto1`. Si occupa di leggere i dati di telemetria del raspberry e salvarli in una cartella "Dati" sotto forma di file json.


## 2. `index.ts`
**Descrizione**: File che contiene il secondo programma costantemente in esecuzione tramite pm2, contenuto nella cartella `progetto1`. Si occupa di leggere i file json contenuti nella cartella "Dati" e trasformarli secondo lo schema prisma fornito, in modo da renderli oggetti allocabili in un database postgreSQL in una tabella "Dati" dedicata.


## 3. `index.html`
**Descrizione**: File che contiene il sito html che viene hostato all'indirizzo `http://localhost:3000`, mostra i dati di telemetria in tempo reale e contiene un form di input che permette di selezionare una data e un'ora specifica per visualizzare i dati, comunicando con il file `ricerca.ts`.


## 4. `ricerca.ts`
**Descrizione**: File che contiene il codice typescript necessario alla ricerca dei dati inseriti dall'utente nel form di input in `index.html` nel database e alla visualizzazione. Funziona tramite richieste http post e get ed è hostato sulla porta 5000, contiene inoltre la configurazione della comunicazione tra i due server.
 

## 5. `File di setup json, prisma e cartella dati.`
**Descrizione**: Sono i file di setup creati durante la fase di installazione e configurazione del progetto, tramite una serie di comandi spiegata nel dettaglio nel sito https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql .
La cartella Dati serve come cartella d'appoggio per i dati in formato .json salvati dal programma `server.js` e letti successivamente da `index.ts`, serve inoltre per il debug e il controllo dei dati in tempo reale.


## Il progetto è mancante della cartella "node_modules", necessaria al funzionamento, sarà necessario installare quindi le dipendenze manualmente tramite terminale.

**Lista delle librerie da installare**: `pm2, typescript, prisma (client and dependencies), nodejs, express, cors`.

<hr>
