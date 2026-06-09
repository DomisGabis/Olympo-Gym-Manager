import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[WebSocket]: Nowe połączenie. ID klienta: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[WebSocket]: Klient rozłączony. ID: ${socket.id}`);
  });
});

export { io };

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Olympo Backend wystartował pomyślnie!`);
  console.log(`Serwer HTTP działa na porcie: ${PORT}`);
  console.log(`Serwer WebSockets jest gotowy do pracy`);
  console.log(`=========================================`);
});