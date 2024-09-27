import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Crea un'istanza di PrismaClient
const prisma = new PrismaClient();

function naturalSort(a: string, b: string): number {
  const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
  return numA - numB;
}

// Funzione principale per elaborare i file JSON e inserirli nel database
async function main() {
  // Percorso della directory che contiene i file JSON
  const directoryPath = path.join(__dirname, 'dati');

  try {
    // Leggi tutti i file nella directory
    const files = fs.readdirSync(directoryPath).sort(naturalSort);

    // Ottieni il numero di record nel database
    const recordCount = await prisma.dati.count();
    
    // Se il numero di file è maggiore del numero di record nel database
    if (files.length > recordCount) {
      // Prendi solo l'ultimo file dalla lista ordinata
      const lastFile = files[files.length - 1];
      const filePath = path.join(directoryPath, lastFile);
      
      // Leggi e analizza il contenuto dell'ultimo file JSON
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      // Inserisci i dati dell'ultimo file nella tabella Dati
      await prisma.dati.create({
        data: {
          timestamp: data.TIMESTAMP.time,
          ram_total: data.RAM.total,
          ram_free: data.RAM.free,
          ram_used: data.RAM.used,
          ram_usage: data.RAM.usage,
          cpu_usage: data.CPU.usage,
          disk_total: data.Disk.total,
          disk_free: data.Disk.free,
          disk_used: data.Disk.used,
          disk_usage: data.Disk.usage,
          ram_stressed: data.RAM.stressed || false,
          cpu_stressed: data.CPU.stressed || false,
          disk_stressed: data.Disk.stressed || false,
        },
      });

      console.log(`Dati salvati da ${lastFile}`);
    } else {
      console.log("Il numero di file è uguale o minore rispetto al numero di record nel database. Nessun nuovo file da elaborare.");
    }
  } catch (error) {
    console.error('Errore durante l\'elaborazione dei file JSON:', error);
  }

  // Pianifica il prossimo ciclo di elaborazione dopo 5 minuti
  setTimeout(main, 60000); // 1 minuti in millisecondi
}

// Esegui la funzione principale e gestisci la disconnessione da Prisma
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
