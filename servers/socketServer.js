
function socketServer(io) {

    io.on('connection', (socket) => {

        const userId = socket.handshake.query.userId;

        console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

        // Join a room
        socket.on('join_room', (roomName) => {
            socket.join(roomName);
            console.log(`User ${userId} joined room ${roomName}`);
        });

        // Leave a room
        socket.on('leave_room', (roomName) => {
            socket.leave(roomName);
            console.log(`User ${socket.id} left room ${roomName}`);
        });

        // Send a message to a specific room
        socket.on('send_message', ({ roomName, message }) => {
            if (socket.rooms.has(roomName)) {
                console.log("Room Name: ", roomName)
                console.log(userId, ":", message)
                io.to(roomName).emit('receive_message', { message, sender: socket.id });
            }
            else {
                console.log("Error : User is not in Room");
            }
        })


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




