'use strict'
const webrtc= require('wrtc');
// var first = 0;  // initailizes to zero only on server restart.


function socketServer(io) {


    //////////////////////////////////////////  SFU  //////////////////////////////////////////

    let peers = new Map();
    let consumers = new Map();


    function handleTrackEvent(e, peer, socket, userId) {
        if (e.streams && e.streams[0]) {
            peers.get(peer).stream = e.streams[0];
            const room = usersTorooms[userId]?.[0];
            socket.to(room).emit('newProducer', { 
                id: peer, 
                username: peers.get(peer).username 
            });
        }
    }

    function createPeer() {
        return new webrtc.RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });
    }


    //////////////////////////////////////////  socket.io  //////////////////////////////////////////


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
                io.sockets.to(roomName).emit('user-joined', userId);


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
            socket.broadcast.emit('user-disconnected', userId);
        })

        // socket.off("setup", () => {
        //     console.log("USER DISCONNECTED");
        //     socket.leave(userId);
        //     removeDeadSocketFromMap(userId)
        // });




        //////////////////////////////////////////  SFU  //////////////////////////////////////////







        // io.on('connection', function (socket) {
        // let userId = uuidv4();
        socket.on('close', (event) => {
            peers.delete(userId);
            consumers.delete(userId);

            io.broadcast(JSON.stringify({
                type: 'user_left',
                id: userId
            }));
        });



        // socket.send(JSON.stringify({ 'type': 'welcome', id: userId }));
        socket.emit('welcome', {userId});

        socket.on('peerconnect', async (body) => {

            peers.set(body.uqid, { socket: socket });
            const peer = createPeer();
            peers.get(body.uqid).username = body.username;
            peers.get(body.uqid).peer = peer;
            peer.ontrack = (e) => { handleTrackEvent(e, body.uqid, socket,userId) };
            const desc = new webrtc.RTCSessionDescription(body.sdp);
            await peer.setRemoteDescription(desc);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            const sdp = peer.localDescription
            // const payload = {
            //     type: 'answer',
            // }

            socket.emit('answer', {sdp});
            // io.sockets.to(body.roomName).emit('answer', {sdp, id:body.uqid, username:body.username});

          
        })

        socket.on('getPeers', (body) => {
            let uuid = body.uqid;
            const list = [];
            peers.forEach((peer, key) => {
                if (key != uuid) {
                    const peerInfo = {
                        id: key,
                        username: peer.username,
                    }
                    list.push(peerInfo);
                }
            });


            list.forEach((peer) => {
                console.log('peers', peer);
            });
            // const peersPayload = {
            //     type: 'peers',
            //     peers: list
            // }

            // io.sockets.to(body.roomName).emit('peers',{ peers:list});
            socket.emit('peers', { peers:list} );
            
        });

        socket.on('ice', (body) => {
            const user = peers.get(body.uqid);
            if (user?.peer)
                user?.peer?.addIceCandidate(new webrtc.RTCIceCandidate(body.ice)).catch(e => console.log(e));

        });
        
        
        socket.on('consume', async (body) => {
            try {
                // console.log(body);
                
                let { id, sdp, consumerId } = body;
                const remoteUser = peers.get(id);
                const newPeer = createPeer();
                consumers.set(consumerId, newPeer);
                const _desc = new webrtc.RTCSessionDescription(sdp);
                await consumers.get(consumerId).setRemoteDescription(_desc);

                remoteUser.stream.getTracks().forEach(track => {
                    consumers.get(consumerId).addTrack(track, remoteUser.stream);
                });
                const _answer = await consumers.get(consumerId).createAnswer();
                await consumers.get(consumerId).setLocalDescription(_answer);

                const payload = {
                    type: 'consume',
                    sdp: consumers.get(consumerId).localDescription,
                    username: remoteUser.username,
                    id,
                    consumerId
                }

                socket.emit('consume', payload);         //
            } catch (error) {
                console.log(error)
            }
        });

        socket.on('consumer_ice', (body) => {
            if (consumers.has(body.consumerId)) {
                consumers.get(body.consumerId).addIceCandidate(new webrtc.RTCIceCandidate(body.ice)).catch(e => console.log(e));
            }
        });

        socket.on('message', function (message) {
            io.broadcast(message);
        });

    });





    io.broadcast = function (data) {
        peers.forEach(function (peer) {
            if (peer.socket.readyState === WebSocket.OPEN) {
                peer.socket.send(data);
            }
        });
    };

    console.log('Server running.');



}





module.exports = socketServer;




