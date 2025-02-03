import React, { useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate, Link } from 'react-router-dom';
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

            // handleUserJoined(userId, localStream)

        })

        return () => {
            socket.off('socket_joined');
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



            {/* <div ref={videoGridRef} style={{ display: 'flex', flexWrap: 'wrap' }} />; */}



            {/* Footer with Play Button */}
            <div className="absolute bottom-4 w-full flex justify-center">
                <button onClick={handlePlay} className="bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 transition duration-300" >PLAY  </button>
                <button onClick={handleVideo} className="bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 transition duration-300" >VIDEO  </button>

            </div>


        </div>

    )
}

export default Joining

