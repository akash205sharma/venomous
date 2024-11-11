const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const socketServer = require('./socketServer'); // Import Socket server setup
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});




// // Middleware and routes setup
// app.use(express.json());
// app.use('/api/auth', authRoutes); // For authentication (login, signup, etc.)
// app.use('/api/users', userRoutes); // For user-related routes


// Initialize the socket server
socketServer(io);



server.listen(4000, () => {
  console.log('Server running on port 4000');
});
