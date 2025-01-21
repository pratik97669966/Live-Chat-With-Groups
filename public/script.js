var socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const params = new URLSearchParams(window.location.search);
var userName = params.get('userName') || 'OPEN_TALK_ADMIN'; // ADMIN to 'Guest' if not provided
var roomName = params.get('roomName') || 'General'; // Default to 'General' if not provided
const usersCounter = document.getElementById('users-counter');

// Emit the 'user-joined' event with the username and room
socket.emit('user-joined', {
    user: userName,
    room: roomName,
});

// Handle form submission for sending messages
form.addEventListener('submit', (e) => {
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
        alert('Please enter a message before sending.');
    }
});

// Server event handlers
socket.on('message-sent', (message) => {
    createMessage(message.message, 'left', message.user);
});

socket.on('user-status-message', (message) => {
    createMessage(message, 'left', 'Open Talk Bot');
});

socket.on('broadcast', (number) => {
    usersCounter.innerHTML = number;
});

// Render the list of users in the room
function renderUserList(list) {
    let roomUsers = document.getElementById('user-list');
    roomUsers.innerHTML = '';

    list.forEach((e) => {
        let user = document.createElement('div');
        user.textContent = e.name;
        user.classList.add('user-name');
        roomUsers.appendChild(user);
    });
}

// Function to create a chat message
function createMessage(msg, dir, userName) {
    const messages = document.getElementById('messages');

    let item = document.createElement('div');
    item.innerHTML = `
        <div class="message-${dir}">
            <div class="user-name">
                <div>${userName}</div>
                <div class="time">${moment().format('hh:mm A')}</div>
            </div>
            <div class="message">${msg}</div>
        </div>
    `;
    item.classList.add('message-wrapper');
    messages.appendChild(item);

    messages.scrollTop += 1000; // Scroll to the bottom for new messages
}
