const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e7
});

app.use(express.static(__dirname + '/public'));

const users = {};

io.on('connection', (socket) => {
    socket.on('set nickname', (nickname) => {
        users[socket.id] = nickname || 'Anonim';
        io.emit('user list', Object.keys(users).map(id => ({ id, name: users[id] })));
    });

    socket.on('chat message', (data) => {
        data.sender = users[socket.id] || 'Anonim';
        socket.broadcast.emit('chat message', data);
    });

    socket.on('delete message', (msgId) => {
        io.emit('message deleted', msgId);
    });

    // WebRTC Siqnal mexanizmi (Zənglər üçün)
    socket.on('call-user', (data) => {
        socket.to(data.to).emit('call-made', {
            offer: data.offer,
            socket: socket.id,
            sender: users[socket.id]
        });
    });

    socket.on('make-answer', (data) => {
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.to).emit('ice-candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.keys(users).map(id => ({ id, name: users[id] })));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server isleyin: ${PORT}`);
});
