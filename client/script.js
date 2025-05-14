const socket = io();
let nickname = "";

// Funktion zum Login
function login() {
  nickname = document.getElementById('nickname').value.trim();
  if (!nickname) return alert("Bitte Namen eingeben");

  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Wenn der Benutzer eine Nachricht sendet
form.addEventListener('submit', e => {
  e.preventDefault();
  if (input.value && nickname) {
    // Sende Nachricht an den Server
    socket.emit('chat message', { name: nickname, text: input.value });
    input.value = '';
  }
});

// Wenn eine Nachricht vom Server kommt (auch alte Nachrichten)
socket.on('chat message', msg => {
  // Prüfen, ob der Text der Nachricht nicht leer ist
  if (msg && msg.text && msg.name) {
    const item = document.createElement('li');
    item.textContent = `[${msg.name}] ${msg.text}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight); // Automatisch nach unten scrollen
  }
});
