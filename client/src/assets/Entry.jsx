import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
const storage = sessionStorage
// const storage = localStorage

// For making different tab as same user

let userId = storage.getItem('userId');
if (!userId) {
	userId = `user_${Date.now()}`; // or use any unique ID logic
	storage.setItem('userId', userId);
}

const socket = io('http://localhost:4000', {
	query: { userId }  // send userId to the server
});



function Entry() {

	const { room, setRoomName, addUser, addMessage, removeUser } = useRoom();
	const [RoomId, setRoomId] = useState("")
	const [user_name, setName] = useState("")
	const navigate = useNavigate();

	// Join a room
	const joinRoom = ({roomName, user_name}) => {
		socket.emit('join_room', {roomName, user_name});
	};

	useEffect(() => {
		socket.on("connect", () => {
			console.log("connect client side", socket.id)
		});

	}, [])



	const handeljoinRoom = (e) => {
		e.preventDefault();
		if(user_name.length!=0){
			if (RoomId.length != 0) {
				setRoomName(RoomId);
				addUser({userId, user:{"user_name":user_name}})
				navigate('/joining')
				joinRoom({roomName: room.roomName,user_name});
				if (!room.users[userId]) {
					// userId is not in the room
					addUser(userId);
				}
				
			}
			else {
				alert("Enter Room id")
			}
		}
		else{
			alert("Enter Your Name to display")
		}
	}
	
	const handelnamechange = (e) => {
		setName(e.target.value);
	}
	const handelroomchange = (e) => {
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

				<form className='bg-blue-700 rounded-2xl p-10 m-auto flex flex-col gap-8 ' onSubmit={handeljoinRoom}>
					{/* <div >Join or Create Room </div> */}
					<input className='p-3 w-full rounded-xl text-2xl ' type="text" name='Room' onChange={handelnamechange} value={user_name} placeholder='Enter Your Name' />
					<input className='p-3 w-full rounded-xl text-2xl ' type="text" name='Room' onChange={handelroomchange} value={RoomId} placeholder='Enter Room Id' />
					<div className='flex justify-between  '>
						<button onClick={suggest} className='py-2 px-6 text-white text-md bg-green-500 rounded-xl active:bg-green-800 focus:bg-green-500' type='button'>Suggest new Room Id</button>
						<button className='py-2 px-6 text-white text-2xl bg-green-500 rounded-xl active:bg-green-800 focus:bg-green-500' type='submit' >Join</button>
					</div>

				</form>


			</div>
		</>
	)
}

export default Entry
