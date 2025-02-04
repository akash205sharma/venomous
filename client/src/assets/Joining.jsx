import React, { useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate, Link } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useCallback } from 'react';
import ReactPlayer from 'react-player'
import { useStreams } from '../context/StreamsContext';

// const WS_PORT = 5000;
const configuration = {
    iceServers: [
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};


// const storage = localStorage   // different tabs same user
const storage = sessionStorage   //a tab a user
let userId = storage.getItem('userId');
if (!userId) {
    userId = `user_${Date.now()}`; // or use any unique ID logic
    // userId = socket.id; // or use any unique ID logic
    storage.setItem('userId', userId);
}


// const socket = io('http://192.168.152.46:4000', {
const socket = io('http://localhost:4000', {
    query: { userId }  // send userId to the server
});


const Joining = () => {




    //    // use useRef for socket to persists
    // const websocket=useRef(null);
    // websocket.current = io('http://localhost:4000', {
    //     query: { userId }  // send userId to the server
    // });

    // socket = websocket.current;



    const { room, setUsers, updateRoom, setScore, setTurn, setRoomName, addUser, addMessage, clearRoom, removeUser } = useRoom();
    const { streams, addLocalStream, addRemoteStream } = useStreams();
    const user_name = room.users[userId]?.user_name;
    const roomName = room.roomName
    const navigate = useNavigate();


    // Join a room
    const joinRoom = ({ roomName, user_name }) => {
        socket.emit('join_room', { roomName, user_name });
    };

    // Leave a room
    const leaveRoom = (roomName) => {
        socket.emit('leave_room', roomName);
    };

    useEffect(() => {

        joinRoom({ roomName: room.roomName, user_name });    /******** Very imp for Now ********/

    }, [roomName, user_name])


    const [localStream, setLocalStream] = useState(null);
    const [peers, setPeers] = useState(() => new Map());
    let localpeer;
    let consumers = new Map();
    const [localUUID, setLocalUUID] = useState(userId ? userId : null);

    // const [remoteStreams, setRemoteStreams] = useState([])

    useEffect(() => {
        startStream();
    }, [])

    useEffect(() => {
        socket.on('socket_joined', ({ userId, users }) => {
            setUsers(users);
            console.log("new user joined : ", userId);
            console.log("users array is: ", users)
            console.log("room is: ", room)
            // handleUserJoined(userId, localStream)


            socket.on('welcome', () => setLocalUUID(userId));
            socket.on('answer', handleAnswer);
            socket.on('peers', ({ peers }) => handlePeers(peers));
            socket.on('consume', handleConsume);
            socket.on('newProducer', handleNewProducer);
            socket.on('user_left', removeUserVideo);
            socket.on('ice', handleIceCandidate);
            socket.on('consumer_ice', handleConsumerIceCandidate);

        })

        return () => {
            socket.off('socket_joined');
            socket.close();
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
        }
    }, [socket])





    const handlePlay = (e) => {
        e.preventDefault();
        navigate("/room")
    }
    const handleVideo = (e) => {
        e.preventDefault();
        navigate("/video")
    }

    const handleLeave = (e) => {
        e.preventDefault();
        leaveRoom(room.roomName);  // Ensure this function works as intended
        clearRoom();    // deleting from my localstorage only 
        navigate("/");      // Navigate back to the home page
    };






    const startStream = async () => {
        const constraints = {
            audio: true,
            video: {
                width: { min: 320, max: 1280 },
                height: { min: 180, max: 720 },
                frameRate: 30,
            },
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // setLocalStream(stream);     //Very very Imp
            addLocalStream(stream);

            localpeer = createPeer();
            // addLocalStreamToUI(stream);
            stream.getTracks().forEach((track) => localpeer.addTrack(track, stream));

        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
        await consumeAll();
    };



    async function handleRemoteTrack(stream, username) {
          
        addRemoteStream(stream, username);
        
    }


    async function consumeAll() {
        const payload = {
            type: 'getPeers',
            uqid: userId,
            // uqid: localUUID,
            roomName,
        }
        socket.emit('getPeers', payload);
    }


    const createPeer = () => {
        localpeer = new RTCPeerConnection(configuration);

        localpeer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice', {
                    // type: 'ice',
                    ice: event.candidate,
                    uqid: userId,
                });
            }
        };

        localpeer.onnegotiationneeded = async () => {
            const offer = await localpeer.createOffer();
            await localpeer.setLocalDescription(offer);
            socket.emit('peerconnect', {
                type: 'peerconnect',
                sdp: localpeer.localDescription,
                // uqid: localUUID,
                uqid: userId,
                username: room.users[userId]?.user_name, // Replace with dynamic input
            });
        };

        return localpeer;
    };


    const handlePeers = (peers) => {
        console.log('handlePeers: peers', peers);
        peers.forEach((peer) => {
            // setPeers((prev) => new Map(prev).set(peer.id, peer));
            setPeers((prev) => ({ ...prev, [peer.id]: peer }));
            console.log('peers', peer);
            consume(peer);
        });
    };


    const [userId_consumerId, setUserId_consumerId] = useState(null);


    const consume = useCallback(async (peer) => {
        let consumerId;
        if (userId_consumerId && userId_consumerId[peer.id]) {
            consumerId = userId_consumerId[peer.id];
        }
        else {
            consumerId = uuidv4();
            setUserId_consumerId((prev) => ({ ...prev, [peer.id]: consumerId }));

        }
        const consumerPeer = new RTCPeerConnection(configuration);

        setPeers((prevPeers) => {
            // Ensure prevPeers is a Map
            const newPeers = new Map(prevPeers instanceof Map ? prevPeers : []);

            if (newPeers.has(peer.id)) {
                newPeers.set(peer.id, {
                    ...newPeers.get(peer.id), // Preserve existing properties
                    consumerId: consumerId,   // Update consumerId
                });
            }

            return newPeers; // Return the updated Map
        });

        //}

        consumerPeer.id = consumerId;
        consumerPeer.peer = peer;
        consumers.set(consumerId, consumerPeer);
        consumers.get(consumerId).addTransceiver('video', { direction: "recvonly" })
        consumers.get(consumerId).addTransceiver('audio', { direction: "recvonly" })

        const offer = await consumers.get(consumerId).createOffer();
        await consumers.get(consumerId).setLocalDescription(offer);;
        consumers.get(consumerId).onicecandidate = (e) => handleConsumerIceCandidate(e, peer.id, consumerId);

        consumers.get(consumerId).ontrack = (e) => {
            // handleRemoteTrack(e.streams[0], peer.username, consumerId);
            handleRemoteTrack(e.streams[0], peer.username);
        };


        console.log('consuming peer', peer.id);

        socket.emit('consume', {
            type: 'consume',
            id: peer.id,
            consumerId,
            sdp: consumerPeer.localDescription,
            roomName
        });


    }, [userId_consumerId]);



    const handleConsume = useCallback(async ({ sdp, id, consumerId }) => {
        const desc = new RTCSessionDescription(sdp);
        // const consumer = [...consumers.get(consumerId)];
        const consumer = consumers.get(consumerId);

        console.log('consumerId', consumerId);
        console.log('consumers', consumers);
        console.log('consumer', consumers.get(consumerId));


        // forgetting after reloading / need to store in session storage


        if (consumer) {
            await consumer.setRemoteDescription(desc);
            console.log('setRemoteDescription', desc);
        }

    }, [consumers]);

    const handleAnswer = async ({ sdp }) => {
        const desc = new RTCSessionDescription(sdp);
        // const peer = peers.get(localUUID)?.peer;

        if (localpeer) {
            await localpeer.setRemoteDescription(desc);
        }
        else {
            console.log('peer not found', localpeer);
        }
    };

    const handleNewProducer = ({ id, username }) => {
        // console.log('new producer', id, username);

        if (id === localUUID) return;
        setPeers((prev) => ({ ...prev, [id]: username }));
        // setPeers((prev) => new Map(prev).set(id, { id, username }));
        consume({ id, username });
    };


    const removeUserVideo = ({ id }) => {
        const peer = peers.get(id);
        if (peer) {
            peer.stream.getTracks().forEach((track) => track.stop());
        }
        setPeers((prev) => {
            const newPeers = new Map(prev);
            newPeers.delete(id);
            return newPeers;
        });
    };



    const handleIceCandidate = ({ candidate }) => {
        if (candidate && candidate.candidate && candidate.candidate.length > 0) {
            const payload = {
                type: 'ice',
                ice: candidate,
                uqid: localUUID
            }
            socket.emit('ice', payload);
        }
    }


    function handleConsumerIceCandidate(e, id, consumerId) {

        const { candidate } = e;
        if (candidate && candidate.candidate && candidate.candidate.length > 0) {
            const payload = {
                type: 'consumer_ice',
                ice: candidate,
                uqid: id,
                consumerId
            }
            socket.emit('consumer_ice', payload);
        }
    }

    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };


    const getStreamByUsername = (username) => {
        const userStream = streams.remotestreams?.find(user => user.username === username);
        // const userStream = remoteStreams.find(user => user.username === username);
        // console.log("Username",username,"stream",userStream)
        return userStream ? userStream.stream : null;
    };


    return (
        <div className="bg-[url(bg.avif)] bg-cover bg-center min-h-screen h-max w-screen flex flex-col items-center p-4 relative">

            <button onClick={handleLeave} className='z-40 py-3 px-6 hover:bg-red-600 transition duration-300 fixed top-0 left-[43vw] bg-red-500 rounded-lg p-2 text-white font-bold' >Leave Game Room {room.roomName} </button>
            {/* {localStream && <ReactPlayer className="border border-y-black" playing height={300} width={300} url={localStream} />} */}

            {/* User and Video Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
                {Object.keys(room.users).length > 0 ? (
                    Object.keys(room.users).map((user_Id) => (
                        <div
                            key={user_Id}
                            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col items-center transition-transform transform hover:scale-105 relative"
                        >
                            {/* Video Stream */}
                            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                                {/* Placeholder for Video */}

                                {(user_Id === userId) ? (
                                    <ReactPlayer
                                        className="border border-y-black w-full h-full object-cover"
                                        playing
                                        height={200}
                                        width={200}
                                        url={streams.localstream} />
                                ) : (
                                    (getStreamByUsername(room.users[user_Id]?.user_name)) ? (
                                        <ReactPlayer
                                            className="border border-y-black w-full h-full object-cover"
                                            playing
                                            height={200}
                                            width={200}
                                            url={getStreamByUsername(room.users[user_Id]?.user_name)} />
                                    ) : (<p className="text-gray-500">No video</p>)
                                )}
                            </div>

                            {/* User Info */}
                            <div className="p-4 w-full text-center">
                                <p className="text-white text-lg font-semibold">{room.users[user_Id]?.user_name || "Unknown"}</p>
                                <p className="text-gray-400 text-sm">{user_Id}</p>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-4xl text-center fixed top-[45vh] left-[36vw] text-white">No users in the room yet...</div>
                )}
            </div>



            {/* Footer with Play Button */}
            <div className="absolute bottom-4 w-full flex justify-center">
                <button onClick={handlePlay} className="bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 transition duration-300" >PLAY  </button>

            </div>


        </div>

    )
}

export default Joining

