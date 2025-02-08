/*All Code For Video */



/*

window.onload = () => {
    init();
};

let peer = null;
const configuration = {
    iceServers: [
        { 'urls': 'stun:stun.stunprotocol.org:3478' },
        { 'urls': 'stun:stun.l.google.com:19302' },
    ]
};
const WS_PORT = 5000;
const username = document.querySelector('#username');
const connectBtn = document.querySelector('#connect');
const remoteContainer = document.querySelector('#remote_videos');
connectBtn.addEventListener('click', connect)

let localUUID = null;
let localStream = null;
let connection = null;
const consumers = new Map();
const clients = new Map();

async function init() {
    console.log('window loaded');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.hostname}:${WS_PORT}`;
    connection = new WebSocket(url);
    connection.onmessage = handleMessage;
    connection.onclose = handleClose;
    connection.onopen = event => {
        connectBtn.disabled = false;
        console.log('socket connected')
    }
}

function recalculateLayout() {
    const container = remoteContainer;
    const videoContainer = document.querySelector('.videos-inner');
    const videoCount = container.querySelectorAll('.videoWrap').length;

    if (videoCount >= 3) {
        videoContainer.style.setProperty("--grow", 0 + "");
    } else {
        videoContainer.style.setProperty("--grow", 1 + "");
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function findUserVideo(username) {
    return document.querySelector(`#remote_${username}`)
}

async function handleRemoteTrack(stream, username) {
    const userVideo = findUserVideo(username);
    if (userVideo) {
        userVideo.srcObject.addTrack(stream.getTracks()[0])
    } else {
        const video = document.createElement('video');
        video.id = `remote_${username}`
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = (username == username.value);

        const div = document.createElement('div')
        div.id = `user_${username}`;
        div.classList.add('videoWrap')

        const nameContainer = document.createElement('div');
        nameContainer.classList.add('display_name')
        const textNode = document.createTextNode(username);
        nameContainer.appendChild(textNode);
        div.appendChild(nameContainer);
        div.appendChild(video);
        document.querySelector('.videos-inner').appendChild(div);
    }

    recalculateLayout();
}

async function handleIceCandidate({ candidate }) {
    if (candidate && candidate.candidate && candidate.candidate.length > 0) {
        const payload = {
            type: 'ice',
            ice: candidate,
            uqid: localUUID
        }
        connection.send(JSON.stringify(payload));
    }
}


async function checkPeerConnection(e) {
    var state = peer.iceConnectionState;
    if (state === "failed" || state === "closed" || state === "disconnected") {

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
        connection.send(JSON.stringify(payload));
    }
}

function handleConsume({ sdp, id, consumerId }) {
    const desc = new RTCSessionDescription(sdp);
    consumers.get(consumerId).setRemoteDescription(desc).catch(e => console.log(e));
}

async function createConsumeTransport(peer) {
    const consumerId = uuidv4();
    const consumerTransport = new RTCPeerConnection(configuration);
    clients.get(peer.id).consumerId = consumerId;
    consumerTransport.id = consumerId;
    consumerTransport.peer = peer;
    consumers.set(consumerId, consumerTransport);
    consumers.get(consumerId).addTransceiver('video', { direction: "recvonly" })
    consumers.get(consumerId).addTransceiver('audio', { direction: "recvonly" })
    const offer = await consumers.get(consumerId).createOffer();
    await consumers.get(consumerId).setLocalDescription(offer);

    consumers.get(consumerId).onicecandidate = (e) => handleConsumerIceCandidate(e, peer.id, consumerId);

    consumers.get(consumerId).ontrack = (e) => {
        handleRemoteTrack(e.streams[0], peer.username)
    };

    return consumerTransport;
}

async function consumeOnce(peer) {
    const transport = await createConsumeTransport(peer);
    const payload = {
        type: 'consume',
        id: peer.id,
        consumerId: transport.id,
        sdp: await transport.localDescription
    }

    connection.send(JSON.stringify(payload))
}

async function handlePeers({ peers }) {
    if (peers.length > 0) {
        for (const peer in peers) {
            clients.set(peers[peer].id, peers[peer]);
            await consumeOnce(peers[peer]);
        }
    }
}

function handleAnswer({ sdp }) {
    const desc = new RTCSessionDescription(sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

async function handleNewProducer({ id, username }) {
    if (id === localUUID) return;

    console.log('consuming', id)
    clients.set(id, { id, username });

    await consumeOnce({ id, username });
}


function handleMessage({ data }) {
    const message = JSON.parse(data);

    switch (message.type) {
        case 'welcome':
            localUUID = message.id;
            break;
        case 'answer':
            handleAnswer(message);
            break;
        case 'peers':
            handlePeers(message);
            break;
        case 'consume':
            handleConsume(message)
            break
        case 'newProducer':
            handleNewProducer(message);
            break;
        case 'user_left':
            removeUser(message);
            break;
    }
}

function removeUser({ id }) {
    const { username, consumerId } = clients.get(id);
    consumers.delete(consumerId);
    clients.delete(id);
    document.querySelector(`#remote_${username}`).srcObject.getTracks().forEach(track => track.stop());
    document.querySelector(`#user_${username}`).remove();

    recalculateLayout();
}

async function connect() { //Produce media
    const constraint = {
        audio: true,
        video: {
            mandatory: {
                width: { min: 320 },
                height: { min: 180 }
            },
            optional: [
                { width: { max: 1280 } },
                { frameRate: 30 },
                { facingMode: "user" }
            ]
        }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraint);
    handleRemoteTrack(stream, username.value)
    localStream = stream;

    peer = createPeer();
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    await subscribe();
}

function handleClose() {
    connection = null;
    localStream.getTracks().forEach(track => track.stop());
    clients = null;
    consumers = null;
}

function createPeer() {
    peer = new RTCPeerConnection(configuration);
    peer.onicecandidate = handleIceCandidate;
    //peer.oniceconnectionstatechange = checkPeerConnection;
    peer.onnegotiationneeded = () => handleNegotiation(peer);
    return peer;
}

async function handleNegotiation(peer, type) {
    console.log('*** negoitating ***')
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    connection.send(JSON.stringify({ type: 'connect', sdp: peer.localDescription, uqid: localUUID, username: username.value }));
}

async function subscribe() { // Consume media
    await consumeAll();
}

async function consumeAll() {
    const payload = {
        type: 'getPeers',
        uqid: localUUID
    }

    connection.send(JSON.stringify(payload));
}




*/
































///*



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



    // const peersRef = useRef(new Map());
    // const consumersRef = useRef(new Map());
    const [localStream, setLocalStream] = useState(null);
    // const [peers, setPeers] = useState(new Map());
    const [peers, setPeers] = useState(() => new Map());
    let localpeer;
    let consumers = new Map();
    // const [consumers, setConsumers] = useState(new Map());
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


        // const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // const url = `${protocol}://${window.location.hostname}:${WS_PORT}`;

        // socket.on('connect', () => console.log('Socket connected'));
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

        // return () => {
        //     socket.off('socket_joined');
        // }
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

            // handleRemoteTrack(stream, user_name);               ///////////
            // addRemoteStreamToUI(stream, user_name);

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


    // async function handleRemoteTrack(stream, username) {
    //     const userVideo = findUserVideo(username);
    //     if (userVideo) {
    //         userVideo.srcObject.addTrack(stream.getTracks()[0])
    //     } else {
    //         const video = document.createElement('video');
    //         video.id = `remote_${username}`
    //         console.log(stream);
    //         video.srcObject = stream;
    //         video.autoplay = true;
    //         // video.muted = (username == username.value);
    //         // video.muted = (username == user_name);

    //         const div = document.createElement('div')
    //         div.id = `user_${username}`;
    //         div.classList.add('videoWrap')

    //         const nameContainer = document.createElement('div');
    //         nameContainer.classList.add('display_name')
    //         const textNode = document.createTextNode(username);
    //         nameContainer.appendChild(textNode);
    //         div.appendChild(nameContainer);
    //         div.appendChild(video);
    //         document.querySelector('.videos-inner').appendChild(div);
    //     }
    // }

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

    const addLocalStreamToUI = (stream) => {
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.className = 'local-video';
        videoContainerRef.current.appendChild(videoElement);
    };

    const addRemoteStreamToUI = (stream, username) => {

        const userVideo = findUserVideo(username);
        if (userVideo) {
            userVideo.srcObject.addTrack(stream.getTracks()[0])
        } else {

            console.log('Remote streams', stream);

            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.autoplay = true;
            videoElement.className = 'remote-video';
            videoElement.title = username;

            const div = document.createElement('div');
            div.className = 'video-container';
            div.appendChild(videoElement);

            const label = document.createElement('p');
            label.textContent = username;
            div.appendChild(label);

            videoContainerRef.current.appendChild(div);
        }
    }




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
        // const consumerId = peer.id;
        // consumers[consumerId] = new RTCPeerConnection(configuration);

        const consumerPeer = new RTCPeerConnection(configuration);



        // peers.get(peer.id).consumerId = consumerId;            /// replace with below  
        //{  
        // setPeers((prevPeers) => {
        //     const newPeers = new Map(prevPeers); // Create a new Map (copy of the old one)
        //     if (newPeers.has(peer.id)) {
        //         newPeers.set(peer.id, {
        //             ...newPeers.get(peer.id), // Keep existing properties
        //             consumerId: consumerId,   // Update consumerId
        //         });
        //     }
        //     return newPeers; // Return the updated Map
        // });
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


        // consumerPeer.addTransceiver('video', { direction: 'recvonly' });
        // consumerPeer.addTransceiver('audio', { direction: 'recvonly' });
        // const offer = await consumerPeer.createOffer();                       
        // await consumerPeer.setLocalDescription(offer);                        
        // consumerPeer.onicecandidate = (e) => handleConsumerIceCandidate(e, peer.id, consumerId);
        // // setConsumers((prev) => new Map(prev).set(consumerId, consumerPeer));

        // setConsumers((prev) => {
        //     const newConsumers = new Map(prev);
        //     newConsumers.set(consumerId, consumerPeer);
        //     return newConsumers;
        // });
        // console.log('consumerPeer', consumerPeer);
        // consumerPeer.ontrack = (event) => {
        //     console.log(' inside ontrack:', event);
        //     handleRemoteTrack(event.streams[0], peer.username);                          /////////////////////////////               /////////////////////////////
        //     addRemoteStreamToUI(event.streams[0], peer.username);
        // }

        const offer = await consumers.get(consumerId).createOffer();
        await consumers.get(consumerId).setLocalDescription(offer);;
        consumers.get(consumerId).onicecandidate = (e) => handleConsumerIceCandidate(e, peer.id, consumerId);

        consumers.get(consumerId).ontrack = (e) => {
            console.log(' inside ontrack:', e);           /////////////////////////////
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



    // const handleConsume = async ({ sdp, id, consumerId }) => {
    const handleConsume = useCallback(async ({ sdp, id, consumerId }) => {
        const desc = new RTCSessionDescription(sdp);
        // const consumer = [...consumers.get(consumerId)];
        const consumer = consumers.get(consumerId);

        console.log('consumerId', consumerId);
        console.log('consumers', consumers);
        console.log('consumer', consumers.get(consumerId));


        // forgetting after reloading / need to store in session storage




        console.log('going to  setRemoteDescription', desc);
        // const newConsumer = new RTCPeerConnection();

        // Set the remote description for the consumer
        // await newConsumer.setRemoteDescription(desc);

        // Add the new consumer to the state
        // setConsumers((prevConsumers) => [...prevConsumers, newConsumer]);

        /////////////

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
            // connection.send(JSON.stringify(payload));
        }
    }


    function handleConsumerIceCandidate(e, id, consumerId) {
        // console.log("handleConsumerIceCandidate", e, id, consumerId);

        const { candidate } = e;
        if (candidate && candidate.candidate && candidate.candidate.length > 0) {
            const payload = {
                type: 'consumer_ice',
                ice: candidate,
                uqid: id,
                consumerId
            }
            socket.emit('consumer_ice', payload);
            // connection.send(JSON.stringify(payload));
        }
    }

    // console.log("consumers in last",consumers)
    // console.log("peers in last",peers)

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


            {/* <button onClick={startStream}>Start Stream</button> */}

            {/* <div ref={videoContainerRef} className="video-container">

                <div id="remote_videos">
                    <div className="videos-inner"></div>
                </div>
            </div> */}
        </div>
    );
};

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export default VideoCall;


// */