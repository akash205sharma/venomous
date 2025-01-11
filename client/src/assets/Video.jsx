import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRoom } from '../context/RoomContext';


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

    const [localStream, setLocalStream] = useState(null);
    const [peers, setPeers] = useState({});
    const videoGridRef = useRef();


    // Join a room
    const joinRoom = ({ roomName, user_name }) => {
        socket.emit('join_room', { roomName, user_name });
    };

    useEffect(() => {

        joinRoom({ roomName: room.roomName, user_name });    /******** Very imp for Now ********/

    }, [roomName, user_name])


    // useEffect(() => {
    //     socket.on('socket_joined', ({ userId, users }) => {
    //         setUsers(users);
    //         console.log("new user joined : ", userId);
    //         console.log("users array is: ", users)
    //         console.log("room is: ", room)
    //         // handleUserJoined(userId, localStream)
    //     })

    //     return () => {
    //         socket.off('socket_joined');
    //     }
    // }, [socket])



    const createPeerConnection = (userId, stream) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        console.log(stream)
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.ontrack = event => {
            const [remoteStream] = event.streams;
            if (!document.getElementById(userId)) {

                console.log("element created", userId, remoteStream)               //to be comemted

                const videoElement = createVideoElement(userId, remoteStream);
                videoGridRef.current.appendChild(videoElement);
            }
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', { target: userId, candidate: event.candidate });
            }
        };

        return peerConnection;
    };
    
    
    const createVideoElement = (id, stream) => {
        const videoElement = document.createElement('video');
        videoElement.id = id;
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.muted = id === 'local'; // Mute local stream
        videoElement.style.width = '30%';
        videoElement.style.margin = '5px';
        return videoElement;
    };



    const handleUserJoined = useCallback(
        (userId) => {
            console.log("user joined handeling")
            // if (!localStream) return;
            console.log("user joined handeling started")

            const peerConnection = createPeerConnection(userId, localStream);
            setPeers(prev => ({ ...prev, [userId]: peerConnection }));

            peerConnection.createOffer()
                .then(offer => {
                    peerConnection.setLocalDescription(offer);
                    socket.emit('offer', { target: userId, offer });
                    console.log("offer", offer)
                });
        }, [localStream]);

    const handleOffer = useCallback(
        async ({ sender, offer }) => {

            console.log("handeling offer")
            if(sender===userId) return;
            const peerConnection = createPeerConnection(sender, localStream);
            setPeers(prev => ({ ...prev, [sender]: peerConnection }));

            peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', { target: sender, answer });

        }, [localStream]);

    const handleAnswer = useCallback(({ sender, answer }) => {
        if(sender===userId) return;
        const peerConnection = peers[sender];

        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    }, []);

    const handleCandidate = useCallback(({ sender, candidate }) => {
        console.log("candidate handeling")
        if(sender===userId) return;
        const peerConnection = peers[sender];
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }, []);

    const handleUserDisconnected = useCallback((userId) => {
        if (peers[userId]) {
            peers[userId].close();
            setPeers(prev => {
                const updatedPeers = { ...prev };
                delete updatedPeers[userId];
                return updatedPeers;
            });
        }
        const videoElement = document.getElementById(userId);
        if (videoElement) videoElement.remove();
    }, []);



    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {

                setLocalStream(stream);
                if (!document.getElementById('local')) {
                const videoElement = createVideoElement('local', stream);
                videoGridRef.current.appendChild(videoElement);
                }
            })
            .catch((error) => console.error('Error accessing media devices:', error));
    }, []);



    useEffect(() => {


        // joinRoom({ roomName: room.roomName, user_name });    /******** Very imp for Now ********/



        socket.on('socket_joined', ({ userId, users }) => {
            setUsers(users);
            console.log("new user joined : ", userId);
            console.log("users array is: ", users)
            console.log("room is: ", room)
            // handleUserJoined(userId, localStream)
        })

        socket.on('user-joined', handleUserJoined);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('candidate', handleCandidate);
        socket.on('user-disconnected', handleUserDisconnected);

        return () => {
            socket.off('user-joined', handleUserJoined);
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('candidate', handleCandidate);
            socket.off('user-disconnected', handleUserDisconnected);

            socket.disconnect();
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [socket, room, handleUserJoined, handleOffer, handleAnswer, handleCandidate, handleUserDisconnected]);



    return <div ref={videoGridRef} style={{ display: 'flex', flexWrap: 'wrap' }} />;
};

export default VideoCall;
