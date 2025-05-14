const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('client'));

let messages = [];

// 🔁 Lade alte Nachrichten, wenn der Server startet
try {
  const data = fs.readFileSync('messages.json', 'utf-8');
  messages = JSON.parse(data);
  console.log(`🔄 ${messages.length} alte Nachrichten geladen`);
} catch (err) {
  console.log('ℹ️ Keine alten Nachrichten gefunden – starte leer');
}

// 💬 Wenn ein neuer Client sich verbindet
io.on('connection', socket => {
  console.log('✅ Neuer Benutzer verbunden:', socket.id);

  // 🔽 Nur alte Nachrichten an den neuen Client senden (einmalig)
  // Sende nur alte Nachrichten, wenn der Client zum ersten Mal verbunden ist
  messages.forEach(msg => {
    socket.emit('chat message', msg);
  });

  // 🔼 Wenn der Client eine neue Nachricht sendet
  socket.on('chat message', msg => {
    console.log(`[${msg.name}] ${msg.text}`);

    // Speichern der neuen Nachricht in der Liste
    messages.push(msg);
    saveMessagesToFile();

    // Sende die neue Nachricht an alle verbundenen Clients (nicht die alten)
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('🚪 Benutzer hat Verbindung getrennt');
  });
});

// 💾 Nachrichten in Datei speichern
function saveMessagesToFile() {
  fs.writeFile('messages.json', JSON.stringify(messages, null, 2), err => {
    if (err) console.error('❌ Fehler beim Speichern:', err);
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
