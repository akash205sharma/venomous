
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



        //send game room  data
        socket.on('send_room', (room) => {
            console.log(`User ${userId} attempting to send game to room ${room.roomName}`);
            console.log(socket.id, userId, ":", room)
            socket.broadcast.to(room.roomName).emit('receive_room', { room, sender: userId });
            // io.sockets.to(room.roomName).emit('receive_room', { room, sender: userId });
        })


        socket.off("setup", () => {
            console.log("USER DISCONNECTED");
            socket.leave(userId);
        });


        // video call logic

        socket.on('forward_call', ({to, offer}) => {
        
            socket.broadcast.to(to).emit('incomming_call', { from: userId ,offer });
        
        })
        socket.on('call_accepted', ({ to, ans}) => {
            
            socket.broadcast.to(to).emit('call_accepted', { from: userId , ans });

        })
        socket.on('peer_nego_needed', ({to ,offer })=>{
            
            // console.log("peer_nego_needed",offer)

            socket.broadcast.to(to).emit('peer_nego_needed', { from: userId ,offer });
        })
        socket.on('peer_nego_done',({to,ans})=>{

            console.log("peer_nego_done",ans)
            
            socket.broadcast.to(to).emit('peer_nego_final', { from: userId ,ans });
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




