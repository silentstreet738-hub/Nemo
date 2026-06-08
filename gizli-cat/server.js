const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// Səs ötürülməsi zamanı kəsinti olmaması üçün maksimum paket ölçüsünü artırırıq
const io = new Server(server, {
    maxHttpBufferSize: 1e7
});

app.use(express.static(__dirname + '/public'));

const users = {};

io.on('connection', (socket) => {
    socket.on('set nickname', (nickname) => {
        users[socket.id] = nickname || 'Anonim';
        io.emit('user list', Object.values(users));
    });

    socket.on('chat message', (data) => {
        data.sender = users[socket.id] || 'Anonim';
        socket.broadcast.emit('chat message', data);
    });

    socket.on('delete message', (msgId) => {
        io.emit('message deleted', msgId);
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server isleyin: ${PORT}`);
});
