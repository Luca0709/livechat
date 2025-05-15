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

  // 🔽 Nur alte Nachrichten an den neuen Client senden
  messages.forEach(msg => {
    socket.emit('chat message', msg);
  });

  // 🔼 Neue Nachricht empfangen
  socket.on('chat message', msg => {
    console.log(`[${msg.name}] ${msg.text}`);

    // Nachricht formatieren
    const formattedMsg = {
      name: escapeHtml(msg.name),
      text: formatText(msg.name, msg.text)
    };

    // Speichern
    messages.push(formattedMsg);
    saveMessagesToFile();

    // An alle senden
    io.emit('chat message', formattedMsg);
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

// 🔤 HTML escapen für Sicherheit
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ✨ Formatierung anwenden
function formatText(name, text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('*')) {
    return `<strong>${escapeHtml(trimmed.slice(1).trim())}</strong>`;
  } else if (trimmed.startsWith('/')) {
    return `<em>${escapeHtml(trimmed.slice(1).trim())}</em>`;
  }else if (trimmed.startsWith('$')) {
    return `<span style="color:red;">${escapeHtml(trimmed.slice(1).trim())}</span>`;
  }else if(name.toLowerCase().includes("hitler")) {
    return `<span style="color:red;"><strong>${trimmed}</strong>🙋‍♂️</span>`;  //${escapeHtml(trimmed.slice(1).trim())}
  }else if(trimmed.startsWith('!')) {
    return `<span style="color:blue;"><strong>${escapeHtml(trimmed.slice(1).trim())}</strong></span>`;
  }
   else {
    return escapeHtml(trimmed);
  }
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
