
function socketServer(io) {

    io.on('connection', (socket) => {

        const userId = socket.handshake.query.userId;

        console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

        // Join a room
        socket.on('join_room', (roomName) => {
            socket.join(roomName);
            console.log(`User ${userId} joined room ${roomName}`);
        });

        socket.off('join_room', (roomName) => {
            socket.leave(roomName);
            console.log(`User ${socket.id} left room ${roomName}`);
        });


        // Leave a room
        socket.on('leave_room', (roomName) => {
            socket.leave(roomName);
            console.log(`User ${socket.id} left room ${roomName}`);
        });


        // Send a message to a specific room
        socket.on('send_message', ({ roomName, message }) => {
            console.log(`User ${userId} attempting to send message to room ${roomName}`);
            console.log(socket.id, userId, ":", message)
            io.sockets.to(roomName).emit('receive_message', { message, sender: userId });
        })

        socket.off("setup", () => {
            console.log("USER DISCONNECTED");
            socket.leave(userId);
        });

    });


}

module.exports = socketServer;







/*    socket without room
 
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
 
        // Listen for data from the client
        socket.on('send_data', (data) => {
            // console.log('Data received:', data);
            // Emit data back to all connected clients
            io.emit('receive_data', data);
        });
 
 
        // Disconnect
 
        // socket.on('disconnect', () => {
        //     console.log('User disconnected:', socket.id);
        // });
 
 
    });
*/




