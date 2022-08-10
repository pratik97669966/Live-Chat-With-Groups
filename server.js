const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 5000;
let usersNum = 0;
http.listen(PORT, () => console.log(`server started at port: ${PORT}`));

//Express setup functions
app.use(express.static('public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});
const users = {};
usersList = [];

//Socket.io event handler functions
io.on('connection', socket => {
	console.log('user connected');
	usersNum += 1;
	socket.on('user-joined', cb => {
		socket.join(cb.room);
		io.emit('broadcast', `Online: ${usersNum}`);
		socket.to(cb.room).emit('user-status-message', `A new user '${cb.user}' has joined`);

		let currentUser = new User(socket.id, cb.user, cb.room);
		usersList.push(currentUser);

		let currentRoomUsers = usersList.filter(e => {
			return e.room == cb.room;
		});

		io.to(cb.room).emit('user-list-update', currentRoomUsers);
	});

	socket.on('message-sent', message => {
		socket.to(message.room).emit('message-sent', message);
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
		usersNum -= 1;
		

		let userLeft = usersList.find(e => e.id == socket.id);
		if (userLeft) {
			
			io.emit('user-disconnected', users[socket.id]);
            delete users[socket.id];
			usersList = usersList.filter(e => {
				return e.id != socket.id;
			});

			let currentRoomUsers = usersList.filter(e => {
				return e.room == userLeft.room;
			});
			io.emit('broadcast', `Online: ${usersNum}`);
			socket.broadcast.emit('user-disconnected', users[socket.id]);
			io.to(userLeft.room).emit('user-list-update', currentRoomUsers);
			socket.to(userLeft.room).emit('user-status-message', `'${userLeft.name}' left`);
			
		} else {
			console.log('Error: User does not exist (Server may have been restarted)');
		}
	});
});

class User {
	constructor(id, name, room) {
		this.id = id;
		this.name = name;
		this.room = room;
	}
}
