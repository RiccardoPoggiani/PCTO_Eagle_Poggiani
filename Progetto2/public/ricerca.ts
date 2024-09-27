import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Importa il pacchetto cors
import { PrismaClient } from '@prisma/client'; // Aggiunto Prisma Client
import path from 'path';

const prisma = new PrismaClient();
const app = express();

// Abilita CORS per tutte le richieste
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint per la ricerca
app.post('/search', async (req, res) => {
  const { searchTerm } = req.body; // Assicurati che il tuo form invii `searchTerm`

  console.log(searchTerm);
  
  try {
    const dati = await prisma.dati.findMany({
      where: {
        OR: [
          {
            timestamp: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (dati.length > 0) {
      res.json(dati); // Restituisci i risultati come JSON
    } else {
      res.json([]); // Restituisci un array vuoto se non ci sono risultati
    }
  } catch (err) {
    console.error('Errore durante la ricerca:', err);
    
  }
});

// Avvio del server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
