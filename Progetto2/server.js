const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const app = express();
const port = 3000;



// Middleware per gestire le richieste JSON
app.use(express.json());

// Middleware per servire file statici
app.use(express.static(path.join(__dirname, 'public'))); // Assicurati di avere la cartella 'public'

// Percorso della cartella in cui salvare i file JSON
const dataFolderPath = '/root/progetto2/dati';

// Verifica se la cartella esiste, altrimenti la crea
if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath, { recursive: true });
}


// Variabili per gestire il contatore
let currentId = 0; // Contatore per gli ID dei file

// Funzione per ottenere l'ID massimo dai file esistenti
function loadCurrentId() {
    fs.readdir(dataFolderPath, (err, files) => {
        if (err) {
            console.error('Errore durante la lettura della cartella:', err);
            return;
        }

        // Filtra i file JSON e estrae gli ID
        const ids = files
            .filter(file => file.startsWith('dati_') && file.endsWith('.json'))
            .map(file => parseInt(file.replace('dati_', '').replace('.json', ''), 10))
            .filter(id => !isNaN(id));
        
        if (ids.length > 0) {
            currentId = Math.max(...ids); // Ottieni il massimo ID
        }
    });
}

// Carica l'ID corrente dai file esistenti
loadCurrentId();


// Funzione per ottenere l'utilizzo della CPU
function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;

    cpus.forEach((cpu) => {
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = (1 - idle / total) * 100;

    return usage.toFixed(2); // Percentuale di utilizzo della CPU
}

// Funzione per ottenere l'utilizzo della RAM
function getRAMUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = (usedMem / totalMem) * 100;

    return {
        total: (totalMem / 1024 / 1024).toFixed(2), // in MB
        free: (freeMem / 1024 / 1024).toFixed(2),   // in MB
        used: (usedMem / 1024 / 1024).toFixed(2),   // in MB
        usage: usage.toFixed(2)                     // Percentuale di utilizzo della RAM
    };
}

// Funzione per ottenere l'utilizzo del disco
function getDiskUsage() {
    let totalDisk = 0, freeDisk = 0;

    try {
        const diskInfo = execSync('df -k --total | grep total').toString();
        const diskValues = diskInfo.split(/\s+/);
        totalDisk = parseInt(diskValues[1], 10); // in KB
        freeDisk = parseInt(diskValues[3], 10);  // in KB
    } catch (error) {
        console.error('Errore durante la lettura del disco:', error);
    }

    const usedDisk = totalDisk - freeDisk;
    const usage = (usedDisk / totalDisk) * 100;

    return {
        total: (totalDisk / 1024).toFixed(2), // in MB
        free: (freeDisk / 1024).toFixed(2),   // in MB
        used: (usedDisk / 1024).toFixed(2),   // in MB
        usage: usage.toFixed(2)               // Percentuale di utilizzo del disco
    };
}

// Variabili per tenere traccia del tempo di stress
const stressThreshold = 50; // Soglia di utilizzo per lo stress
const stressDuration = 120000; // Durata in millisecondi (2 minuti)

let ramStressedSince = null;
let cpuStressedSince = null;
let diskStressedSince = null;

// Funzione per aggiornare i valori di stress
function updateStressValues() {
    const ramUsage = getRAMUsage();
    const cpuUsage = getCPUUsage();
    const diskUsage = getDiskUsage();

    // Aggiorna RAM
    if (ramUsage.usage > stressThreshold) {
        if (!ramStressedSince) {
            ramStressedSince = Date.now();
        } 
        console.log("RAM"+ ramStressedSince);
    } else {
        ramStressedSince = null; // Resetta se non supera la soglia
    }

    // Aggiorna CPU
    if (cpuUsage > stressThreshold) {
        if (!cpuStressedSince) {
            cpuStressedSince = Date.now();
        }
        console.log("Cpu"+ cpuStressedSince);
    } else {
        cpuStressedSince = null; // Resetta se non supera la soglia
    }

    // Aggiorna Disco
    if (diskUsage.usage > stressThreshold) {
        if (!diskStressedSince) {
            diskStressedSince = Date.now();
        }
        console.log("Disco"+ diskStressedSince);
    } else {
        diskStressedSince = null; // Resetta se non supera la soglia
    }

    return {
        ram_stressed: !!ramStressedSince && (Date.now() - ramStressedSince > stressDuration),
        cpu_stressed: !!cpuStressedSince && (Date.now() - cpuStressedSince > stressDuration),
        disk_stressed: !!diskStressedSince && (Date.now() - diskStressedSince > stressDuration)
    };
}


//Funzione per gestire il numero di file nella cartella e cancellare il più vecchio se necessario

function manageFolderFiles(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Errore durante la lettura della cartella:', err);
            return;
        }

        const filePaths = files.map(file => path.join(folderPath, file)).filter(filePath => {
            return fs.statSync(filePath).isFile();
        });
/*
        if (filePaths.length > 10) {
            filePaths.sort((a, b) => {
                return fs.statSync(a).mtime - fs.statSync(b).mtime;
            });

            const oldestFile = filePaths[0];
            fs.unlink(oldestFile, (err) => {
                if (err) {
                    console.error('Errore durante la cancellazione del file più vecchio:', err);
                } else {
                    console.log(`Il file più vecchio è stato cancellato: ${oldestFile}`);
                }
            });
        }
        */
    });
}

//Funzione per ottenere il prossimo ID
function getNextId() {
    currentId += 1;
    return currentId;
}

// Funzione per salvare i dati su un file JSON con nome univoco
function saveDataToFile() {
    console.log('Salvataggio dei dati...');
    const ora = Date.now();
    const date = new Date(ora);
    const timestamp = date.toISOString();

    const ramUsage = getRAMUsage();
    const cpuUsage = getCPUUsage();
    const diskUsage = getDiskUsage();
    
    // Aggiorna i valori di stress
    const stressValues = updateStressValues(); // Restituisce { ram_stressed, cpu_stressed, disk_stressed }

    const data = {
        TIMESTAMP: {
            time: `${timestamp}`,
        },
        RAM: {
            total: `${ramUsage.total} MB`,
            free: `${ramUsage.free} MB`,
            used: `${ramUsage.used} MB`,
            usage: `${ramUsage.usage}%`,
            stressed: stressValues.ram_stressed // Booleano per stress RAM
        },
        CPU: {
            usage: `${cpuUsage}%`,
            stressed: stressValues.cpu_stressed // Booleano per stress CPU
        },
        Disk: {
            total: `${diskUsage.total} MB`,
            free: `${diskUsage.free} MB`,
            used: `${diskUsage.used} MB`,
            usage: `${diskUsage.usage}%`,
            stressed: stressValues.disk_stressed // Booleano per stress Disco
        }
    };

    manageFolderFiles(dataFolderPath);
    
    const nextId = getNextId();
    const fileName = `dati_${nextId}.json`;
    const fullPath = path.join(dataFolderPath, fileName);

    try {
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Dati salvati su ${fullPath}`);
    } catch (error) {
        console.error('Errore durante il salvataggio dei dati:', error);
    }
}

// REST API: Endpoint per ottenere l'uso della RAM, CPU e Disco
app.get('/api/usage', (req, res) => {
    const ramUsage = getRAMUsage();
    const cpuUsage = getCPUUsage();
    const diskUsage = getDiskUsage();

    const ora = Date.now();
    const date = new Date(ora);
    const timestamp = date.toISOString();
    
    // Aggiorna i valori di stress
    const stressValues = updateStressValues();

    res.json({
        TIMESTAMP: `${timestamp}`,
        RAM_total: `${ramUsage.total} MB`,
        RAM_free: `${ramUsage.free} MB`,
        RAM_used: `${ramUsage.used} MB`,
        RAM_usage: `${ramUsage.usage}%`,
        RAM_stressed: stressValues.ram_stressed,
        CPU_usage: `${cpuUsage}%`,
        CPU_stressed: stressValues.cpu_stressed,
        Disk_total: `${diskUsage.total} MB`,
        Disk_free: `${diskUsage.free} MB`,
        Disk_used: `${diskUsage.used} MB`,
        Disk_usage: `${diskUsage.usage}%`,
        Disk_stressed: stressValues.disk_stressed
    });
});

// Salva i dati periodicamente ogni 60 secondi
setInterval(saveDataToFile, 60000);

// Avvia il server web per la REST API
app.listen(port, () => {
    console.log(`REST API server avviato su http://localhost:${port}/api/usage`);
    console.log(`File HTML disponibile su http://localhost:${port}`); // Notifica che l'HTML è disponibile
});
