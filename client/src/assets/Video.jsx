import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRoom } from '../context/RoomContext';
import ReactPlayer from 'react-player'

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



const VideoCall = () => {


    const { room, setUsers, updateRoom, setScore, setTurn, setRoomName, addUser, addMessage, clearRoom, removeUser } = useRoom();
    const user_name = room.users[userId]?.user_name;
    const roomName = room.roomName

    // Join a room
    const joinRoom = ({ roomName, user_name }) => {
        socket.emit('join_room', { roomName, user_name });
    };

    useEffect(() => {

        joinRoom({ roomName: room.roomName, user_name });    //******** Very imp for Now ******

    }, [roomName, user_name])


    const [localStream, setLocalStream] = useState(null);
    const [peers, setPeers] = useState(() => new Map());
    let localpeer;
    let consumers = new Map();
    const [clients, setClients] = useState(new Map())
    const [localUUID, setLocalUUID] = useState(userId ? userId : null);
    const videoContainerRef = useRef(null);

    const [remoteStreams, setRemoteStreams] = useState([])

    useEffect(() => {
        startStream();
    }, [])




    useEffect(() => {
        socket.on('socket_joined', ({ userId, users }) => {
            setUsers(users);
            console.log("new user joined : ", userId);
            console.log("users array is: ", users)
            console.log("room is: ", room)
        })

        socket.on('welcome', () => setLocalUUID(userId));
        socket.on('answer', handleAnswer);
        socket.on('peers', ({ peers }) => handlePeers(peers));
        socket.on('consume', handleConsume);
        socket.on('newProducer', handleNewProducer);
        socket.on('user_left', removeUserVideo);
        socket.on('ice', handleIceCandidate);
        socket.on('consumer_ice', handleConsumerIceCandidate);

        return () => {
            socket.close();
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
        };

    }, [socket]);



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

            setLocalStream(stream);
            localpeer = createPeer();
            // addLocalStreamToUI(stream);
            stream.getTracks().forEach((track) => localpeer.addTrack(track, stream));

        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
        await consumeAll();
    };

    function findUserVideo(username) {
        return document.querySelector(`#remote_${username}`)
    }


    async function handleRemoteTrack(stream, username) {
        setRemoteStreams(prevStreams => {
            const existingIndex = prevStreams.findIndex(s => s.username === username);

            if (existingIndex !== -1) {
                // Clone state to ensure proper React updates
                const updatedStreams = [...prevStreams];
                updatedStreams[existingIndex].stream.addTrack(stream.getTracks()[0]);
                return updatedStreams;
            } else {
                return [...prevStreams, { username, stream }];
            }
        });
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
            handleRemoteTrack(e.streams[0], peer.username, consumerId);
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


    return (
        <div>
            <h1>React WebRTC with Socket.io</h1>

            {localStream && <ReactPlayer className="border border-y-black" playing height={300} width={300} url={localStream} />}

            <div className="remote-streams-container">
                {remoteStreams.map(({ username, stream }) => (
                    <div key={username} className="remote-stream">
                        <p>{username}</p>
                        <ReactPlayer className="border border-y-black" playing height={300} width={300} url={stream} />
                    </div>
                ))}
            </div>

        </div>
    );
};



export default VideoCall;

