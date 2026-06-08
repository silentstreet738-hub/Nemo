const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

// Aktiv istifadəçilərin siyahısı
const users = {};

io.on('connection', (socket) => {
    // İstifadəçi adını təyin edəndə
    socket.on('set nickname', (nickname) => {
        users[socket.id] = nickname || 'Anonim';
        io.emit('user list', Object.values(users));
    });

    // Mesaj göndəriləndə
    socket.on('chat message', (data) => {
        data.sender = users[socket.id] || 'Anonim';
        socket.broadcast.emit('chat message', data);
    });

    // Mesaj silinəndə
    socket.on('delete message', (msgId) => {
        io.emit('message deleted', msgId);
    });

    // İstifadəçi çıxanda
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server isleyin: ${PORT}`);
});
