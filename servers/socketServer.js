// var first = 0;  // initailizes to zero only on server restart.

//offers will contain {}
const offers = [
    // offererUserName
    // offer
    // offerIceCandidates
    // answererUserName
    // answer
    // answererIceCandidates
];
const connectedSockets = [
    //username, socketId
]


function socketServer(io) {



    const roomsTousers = {
        // 'RoomName': ['user_1', 'user_2'],
    };
    const usersTorooms = {
        // 'user_1': ['RoomName', 1, 'user_name'],
    };

    const addUsersToMap = ([roomName, userId, user_name]) => {
        let usersInroom = roomsTousers[roomName] || [];
        const numberOfUser = usersInroom.length;
        if (!usersInroom.includes(userId)) {
            usersInroom.push(userId);
            roomsTousers[roomName] = usersInroom;
        }
        if (!usersTorooms[userId] || usersTorooms[userId][0] != roomName) usersTorooms[userId] = [roomName, user_name];
        console.log("roomsTousers", roomsTousers)
        console.log("usersTorooms", usersTorooms)
    }

    const removeUserFromMap = ([roomName, userId]) => {
        delete usersTorooms[userId];
        roomsTousers[roomName]?.pop(userId);
        if (roomsTousers[roomName]?.length === 0) { delete roomsTousers[roomName]; }
        console.log("roomsTousers", roomsTousers)
        console.log("usersTorooms", usersTorooms)
    }

    const removeDeadSocketFromMap = (userId) => {
        (usersTorooms[userId]?.forEach(room => {
            roomsTousers[room]?.pop(userId);
            if (roomsTousers[room]?.length === 0) delete roomsTousers[room];
        }))
        delete usersTorooms[userId];
        console.log("roomsTousers", roomsTousers)
        console.log("usersTorooms", usersTorooms)
    }

    const sendUserUpdates = ({ roomName, userId }) => {
        const room = roomsTousers[roomName] || [];
        let users = {};
        (room?.forEach(user => {
            users[user] = usersTorooms[user];
        }))
        io.sockets.to(roomName).emit('socket_joined', { userId, users });
        console.log("data after someone joines or leaves", userId, users);
    }



    io.on('connection', (socket) => {      // runs every time on client reload

        const userId = socket.handshake.query.userId

        console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

        // Join a room
        socket.on('join_room', ({ roomName, user_name }) => {
            if (roomName) {
                socket.join(roomName);
                addUsersToMap([roomName, userId, user_name]);
                console.log(`User ${userId} joined room ${roomName}`);

                //send updates on join
                sendUserUpdates({roomName,userId})

                //for sfu implementaton
                // socket.to(roomName).emit('newPeer', userId);
                // io.sockets.to(roomName).emit('user-joined', userId);


            }
        });

        // socket.off('join_room', ({ roomName}) => {
        //     removeUserFromMap([roomName, userId])
        //     socket.leave(roomName);
        //     console.log(`User ${socket.id} left room ${roomName}`);
        // });


        // Leave a room
        socket.on('leave_room', (roomName) => {
            removeUserFromMap([roomName, userId])
            socket.leave(roomName);
            console.log(`User ${socket.id} left room ${roomName}`);
            //send updates on join
            sendUserUpdates({ roomName, userId })
        });


        // Send a message to a specific room
        socket.on('send_message', ({ roomName, message }) => {
            console.log(`User ${userId} attempting to send message to room ${roomName}`);
            console.log(socket.id, userId, ":", message)
            // io.emit('receive_message', { message, sender: userId });
            // socket.broadcast.to(roomName).emit('receive_room', { room, sender: userId });
            io.sockets.to(roomName).emit('receive_message', { message, sender: userId });
        })

        //send game room  data
        socket.on('send_room', (room) => {
            console.log(`User ${userId} attempting to send game to room ${room.roomName}`);
            console.log(socket.id, userId, ":", room)
            socket.broadcast.to(room.roomName).emit('receive_room', { room, sender: userId });
            // io.sockets.to(room.roomName).emit('receive_room', { room, sender: userId });
        })

        //destroy socket when tab closed
        socket.on("disconnect", () => {
            console.log("USER DISCONNECTED");
            socket.leave(userId);
            removeDeadSocketFromMap(userId)

            //for sfu
            // socket.to("Radha").emit('peerDisconnected', userId);
            // socket.broadcast.emit('user-disconnected', userId);
        })

        // socket.off("setup", () => {
        //     console.log("USER DISCONNECTED");
        //     socket.leave(userId);
        //     removeDeadSocketFromMap(userId)
        // });



        


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




