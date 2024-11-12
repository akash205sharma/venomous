import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import RoomContext from "../context/RoomContext"


// For making different tab as same user

let userId = localStorage.getItem('userId');
if (!userId) {
	userId = `user_${Date.now()}`; // or use any unique ID logic
	localStorage.setItem('userId', userId);
}

const socket = io('http://localhost:4000', {
	query: { userId }  // send userId to the server
});



function Entry() {

	const { Room, SetRoomId } = useContext(RoomContext);

	const navigate = useNavigate();

	// Join a room
	const joinRoom = (roomName) => {
		socket.emit('join_room', roomName);
	};


	const handeljoinRoom = (e) => {
		e.preventDefault();
		if(Room.length!=0) {
			navigate('/room');
			joinRoom(Room);
		}
	}

	const handelchange = (e) => {
		SetRoomId(e.target.value);
	}

	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover bg-center bg h-[100vh] flex justify-center items-center '>

				<form className='bg-blue-700 rounded-2xl p-10 m-auto flex flex-col gap-10 ' onSubmit={handeljoinRoom}>
					{/* <div >Join or Create Room </div> */}
					<input className='p-3  w-[20vw] rounded-xl text-2xl ' type="text" name='Room' onChange={handelchange} value={Room} placeholder='Enter Room Id' />
					<button className='p-2 text-white text-2xl bg-green-500 rounded-xl active:bg-green-800 focus:bg-green-500' type='submit' >Join</button>

				</form>

			</div>
		</>
	)
}

export default Entry
