const socket = io();
let nickname = "";

function login() {
  nickname = document.getElementById('nickname').value.trim();
  if (!nickname) return alert("Bitte Namen eingeben");

  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'flex';
  document.body.classList.add('chat-open');
}

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', e => {
  e.preventDefault();
  if (input.value && nickname) {
    socket.emit('chat message', { name: nickname, text: input.value });
    input.value = '';
  }
});

socket.on('chat message', msg => {
  if (msg && msg.text && msg.name) {
    const item = document.createElement('li');

    const msgText = document.createElement('span');
    msgText.innerHTML = `<strong>[${escapeHtml(msg.name)}]</strong> ${msg.text}`;

    const btnHallOfFame = document.createElement('button');
    btnHallOfFame.classList.add('btn', 'btn-info');
    btnHallOfFame.textContent = 'HallOfFame';
    btnHallOfFame.onclick = () => saveMsgIntoHallOfFame(msg);

    item.appendChild(msgText);
    item.appendChild(btnHallOfFame);

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }
});

function saveMsgIntoHallOfFame(msg) {
  alert("TO BE IMPLEMENTED. MSG: " + msg.text);
}


// Sicherheitsfunktion zum Escapen von HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
