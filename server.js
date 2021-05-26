const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const activeUsers = {};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('connection established...');
  
  socket.on('disconnect', () => {
    handleLeaveChat(socket, io);
  });

  socket.on('leave chat', () => {
    handleLeaveChat(socket, io);
  });

  
  socket.on('register user', (name) => {
    if (normalizedUsersList().includes(name.toLowerCase())) {
      return socket.emit('validation error', 'existing');
    }
    console.log(`${name} has joined!`);
    activeUsers[socket.id] = name;
    console.log(Object.values(activeUsers));
    io.emit('register user', Object.values(activeUsers));
  });

  socket.on('chat message', (msg) => {
    console.log(`${activeUsers[socket.id]} says: ${msg}`);
    
    io.emit('chat message', {user: activeUsers[socket.id], msg});
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});

const normalizedUsersList = () => Object.values(activeUsers).map((user) => user.toLowerCase()) ?? [];

const handleLeaveChat = (socket, io) => {
  if (!activeUsers[socket.id]) return;
  console.log(`${activeUsers[socket.id]} disconnected...`);
  const outboundUser = activeUsers[socket.id]; 
  delete activeUsers[socket.id];
  io.emit('leave chat', Object.values(activeUsers), outboundUser);
}