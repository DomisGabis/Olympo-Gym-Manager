import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// 1. Tworzenie serwera HTTP owijającego naszą aplikację Express
const server = http.createServer(app);

// 2. Inicjalizacja Socket.io i podpięcie pod serwer HTTP
const io = new Server(server, {
  cors: {
    origin: '*', // W środowisku produkcyjnym zastąp to adresem swojego frontendu (np. http://localhost:5173)
    methods: ['GET', 'POST']
  }
});

// 3. Podstawowa konfiguracja połączeń WebSocket
io.on('connection', (socket) => {
  console.log(`[WebSocket]: Nowe połączenie. ID klienta: ${socket.id}`);

  // TODO: Tutaj w przyszłości dojdzie logika czatu i powiadomień
  // socket.on('join_room', (data) => { ... })

  socket.on('disconnect', () => {
    console.log(`[WebSocket]: Klient rozłączony. ID: ${socket.id}`);
  });
});

// Udostępnienie instancji io, by móc z niej korzystać w innych plikach (np. w serwisach)
export { io };

// 4. Uruchomienie serwera
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`💪 Olympo Backend wystartował pomyślnie!`);
  console.log(`🚀 Serwer HTTP działa na porcie: ${PORT}`);
  console.log(`📡 Serwer WebSockets jest gotowy do pracy`);
  console.log(`=========================================`);
});