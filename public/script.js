var socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const params = new URLSearchParams(window.location.search);
// Read the username from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
let userName = urlParams.get('username');  // Assuming the URL contains '?username=someName'
var roomName = params.get('roomName');
const usersCounter = document.getElementById('users-counter');

// If the username is not present or is invalid, use a default name or handle as needed
if (userName  === null || userName == '') {
    userName = 'OPEN_TALK_ADMIN';  // Example without username in url
}
else {

//Event emit functions

socket.emit('user-joined', {
	user: userName,
	room: roomName,
});
}
form.addEventListener('submit', e => {
	e.preventDefault();
	if (input.value) {
		socket.emit('message-sent', {
			user: userName,
			message: input.value,
			room: roomName,
		});
		createMessage(input.value, 'right', 'Me');
		input.value = '';
	} else {
		// alert('Enter something in the text field');
	}
});

//
//
//Server event handlers
socket.on('message-sent', message => {
	createMessage(message.message, 'left', message.user);
});

socket.on('user-status-message', message => {
	createMessage(message, `left`, `Open Talk Bot`);
});
socket.on('broadcast', (number) => {
	usersCounter.innerHTML = number;
});

function renderUserList(list) {
	let roomUsers = document.getElementById('user-list');
	roomUsers.innerHTML = '';

	list.forEach(e => {
		let user = document.createElement('div');
		user.textContent = e.name;
		user.classList.add('user-name');
		roomUsers.appendChild(user);
	});
}

function createMessage(msg, dir, userName) {
	const messages = document.getElementById('messages');

	let item = document.createElement('div');
	item.innerHTML = `
		<div class="message-${dir}">
			<div class="user-name"><div>${userName}</div> <div class="time">${moment().format('hh:mm A')}</div></div>
			<div class="message">${msg}</div>
		</div>
    `;
	item.classList.add('message-wrapper');
	messages.appendChild(item);

	messages.scrollTop += 1000;
}
