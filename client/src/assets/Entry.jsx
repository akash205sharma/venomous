import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';

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

	const { room, setRoomName, addUser, addMessage, removeUser } = useRoom();
	const [RoomId, setRoomId] = useState("")

	const navigate = useNavigate();

	// Join a room
	const joinRoom = (roomName) => {
		socket.emit('join_room', roomName);
	};

	useEffect(() => {
		socket.on("connect", () => {
			console.log("connect client side", socket.id)

		});

	}, [])


	const handeljoinRoom = (e) => {
		e.preventDefault();

		if (RoomId.length != 0) {
			setRoomName(RoomId);
			navigate('/room')
			joinRoom(room.roomName);
			if (!room.users.includes(userId)) {
				// userId is not in the room
				addUser(userId);
			}

		}
		else {
			alert("Enter Room Name")
		}
	}

	const handelchange = (e) => {
		setRoomId(e.target.value);
	}



	const suggest = () => {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let Id = '';
		for (let i = 0; i < 10; i++) {
			const randomI = Math.floor(Math.random() * characters.length);
			Id += characters[randomI];
		}
		setRoomId(Id);
	}


	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover bg-center bg h-[100vh] flex justify-center items-center '>

				<form className='bg-blue-700 rounded-2xl p-10 m-auto flex flex-col gap-10 ' onSubmit={handeljoinRoom}>
					{/* <div >Join or Create Room </div> */}
					<input className='p-3  w-[20vw] rounded-xl text-2xl ' type="text" name='Room' onChange={handelchange} value={RoomId} placeholder='Enter Room Id' />
					<div className='flex justify-between'>
						<button onClick={suggest} className='py-2 px-6 text-white text-md bg-green-500 rounded-xl active:bg-green-800 focus:bg-green-500' type='button'>Suggest new Room Id</button>
						<button className='py-2 px-6 text-white text-2xl bg-green-500 rounded-xl active:bg-green-800 focus:bg-green-500' type='submit' >Join</button>
					</div>

				</form>


			</div>
		</>
	)
}

export default Entry
