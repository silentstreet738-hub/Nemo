const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    // Mesaj göndəriləndə
    socket.on('chat message', (data) => {
        // Gələn mesajı digər istifadəçilərə ID və taymer vaxtı ilə birlikdə ötürür
        socket.broadcast.emit('chat message', data);
    });

    // Mesaj silinəndə
    socket.on('delete message', (msgId) => {
        io.emit('message deleted', msgId);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server isleyin: ${PORT}`);
});
