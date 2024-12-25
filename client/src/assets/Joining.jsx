import React, { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useCallback } from 'react';
import ReactPlayer from 'react-player'
import peer from '../services/peer';


// const storage = localStorage   // different tabs same user
const storage = sessionStorage   //a tab a user
let userId = storage.getItem('userId');
if (!userId) {
    userId = `user_${Date.now()}`; // or use any unique ID logic
    // userId = socket.id; // or use any unique ID logic
    storage.setItem('userId', userId);
}
const socket = io('http://localhost:4000', {
    query: { userId }  // send userId to the server
});


const Joining = () => {

    const { room, setUsers, updateRoom, setScore, setTurn, setRoomName, addUser, addMessage, clearRoom, removeUser } = useRoom();
    const user_name = room.users[userId]?.user_name;
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

    }, [room.roomName, user_name])

    useEffect(() => {
        socket.on('socket_joined', ({ userId, users }) => {
            setUsers(users);
            console.log("new user joined : ", userId);
            console.log("users array is: ", users)
            console.log("room is: ", room)
        })

        return () => {
            socket.off('socket_joined');
        }
    }, [socket])



    const handlePlay = (e) => {
        e.preventDefault();
        navigate("/room")
    }

    const handleLeave = (e) => {
        e.preventDefault();
        leaveRoom(room.roomName);  // Ensure this function works as intended
        clearRoom();    // deleting from my localstorage only 
        navigate("/");      // Navigate back to the home page
    };









    //{    // Video call logic

    const [myStream, setMyStream] = useState()
    const [remoteStreams, setRemoteStreams] = useState([])
    const [remoteStream, setRemoteStream] = useState()

    const handleCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        const offer = await peer.getOffer();
        socket.emit("forward_call", { to: room.roomName, offer });
        setMyStream(stream)
        console.log("Call Forwarding started");

    }, [room.roomName, socket]);


    const handleIncommingCall = useCallback(async ({ from, offer }) => {
        console.log("incomming_call", from, offer);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream)

        const ans = await peer.getAnswer(offer)
        socket.emit('call_accepted', { to: room.roomName, ans });

    }, [socket]);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans)   // await added by myself
        console.log("Call Accepted");
        sendStreams();
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer_nego_needed', { offer, to: room.roomName });

    }, [room.roomName, socket]);   //???????????????????

    const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer_nego_done', { to: from, ans })
    }, [socket])

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans)
    }, []);


    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        }
    }, [handleNegoNeeded])


    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            // console.log('got tracks', remoteStream)

            setRemoteStream(remoteStream[0]);

            // console.log("remoteStream",remoteStream[0])

        })

    }, []);



    useEffect(() => {
        socket.on('incomming_call', handleIncommingCall)
        socket.on('call_accepted', handleCallAccepted)
        socket.on('peer_nego_needed', handleNegoNeedIncomming)
        socket.on('peer_nego_final', handleNegoNeedFinal)

        return () => {
            socket.off('incomming_call', handleIncommingCall)
            socket.off('call_accepted', handleCallAccepted)
            socket.off('peer_nego_needed', handleNegoNeedIncomming)
            socket.off('peer_nego_final', handleNegoNeedFinal)

        }
    }, [socket, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);










    return (
        <div className="bg-[url(bg.avif)] bg-cover bg-center min-h-screen h-max w-screen flex flex-col items-center p-4 relative">

            <button onClick={handleLeave} className='z-40 py-3 px-6 hover:bg-red-600 transition duration-300 fixed top-0 left-[43vw] bg-red-500 rounded-lg p-2 text-white font-bold' >Leave Game Room {room.roomName} </button>

            {/* User and Video Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
                {Object.keys(room.users).length > 0 ? (
                    Object.keys(room.users).map((userId) => (
                        <div
                            key={userId}
                            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col items-center transition-transform transform hover:scale-105 relative"
                        >
                            {/* Video Stream */}
                            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                                {/* Placeholder for Video */}
                                {room.users[userId]?.videoStream ? (
                                    <video
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        muted
                                        playsInline
                                        srcObject={room.users[userId].videoStream}
                                    ></video>
                                ) : (
                                    <p className="text-gray-500">No Video</p>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="p-4 w-full text-center">
                                <p className="text-white text-lg font-semibold">{room.users[userId]?.user_name || "Unknown"}</p>
                                <p className="text-gray-400 text-sm">{userId}</p>
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







// <div className='bg-white h-[50vh] w-[30vw]'>

// users are <br />

// {Object.keys(room.users).map((userId) => (
//     <div key={userId} >
//         <p><strong>User Id : </strong>{userId}</p>
//         <p><strong>Name : </strong>{room.users[userId]?.user_name}</p>
//     </div>
// ))}

// </div>
// <br />
// <button onClick={handlePlay} className="bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 transition duration-300" >PLAY {'>'} </button>

