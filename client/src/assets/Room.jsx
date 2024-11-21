import React, { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';


// const socket = io('http://localhost:4000');

// For making different tab as same user

// const socket = io('http://localhost:4000')

let userId = localStorage.getItem('userId');
if (!userId) {
	userId = `user_${Date.now()}`; // or use any unique ID logic
	// userId = socket.id; // or use any unique ID logic
	localStorage.setItem('userId', userId);
}

const socket = io('http://localhost:4000', {
	query: { userId }  // send userId to the server
});



function Room() {
	const { room, setRoomName, addUser, addMessage, clearRoom, removeUser } = useRoom();
	const [message, setMessage] = useState("")
	const navigate = useNavigate();

	useEffect(() => {

		joinRoom(room.roomName);    //******** very imp for Now

	}, [room.roomName])


	// Join a room
	const joinRoom = (roomName) => {
		socket.emit('join_room', roomName);
	};

	// Leave a room
	const leaveRoom = (roomName) => {
		socket.emit('leave_room', roomName);
	};

	// update if one user leaveRoom///????



	useEffect(() => {

		// Listen for incoming messages from the room
		socket.on('receive_message', ({ message, sender }) => {
			console.log(sender, message);
			addMessage(sender, message);
		});

		// Clean up listener on component unmount
		return () => {
			socket.off('receive_message');
		};  

	}, [socket]);


	// Send a message to a specific room
	const sendMessageToRoom = (e) => {
		e.preventDefault();
		const roomName = room.roomName;
		const users = room.users;
		// joinRoom(roomName);
		socket.emit('send_message', { roomName, message, users });
		setMessage('');
		// console.log('Rooms the svocket is part of:', socket.room);
	};



	const handleLeave = (e) => {
		e.preventDefault();
		leaveRoom(room.roomName);  // Ensure this function works as intended
		clearRoom();    // deleting from my localstorage only 
		navigate("/");      // Navigate back to the home page
	};



	let x = 0;
	let y = 9;

	// const [sendTo, setSendTo] = useState("");
	// const [privateMsg, setPrivateMsg] = useState("");

	// const handelPrivateMessage = (e) => {
	// 	e.preventDefault();
	// 	socket.emit('send_message', { sendTo, privateMsg, });
	// 	setPrivateMsg('')
	// 	setSendTo("")
	// }


	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover bg-center bg h-[100vh]'>


				{/* <form className='flex ' onSubmit={handelPrivateMessage}>
					<input className='p-3  w-[20vw] rounded-xl text-2xl ' type="text" name='Room' onChange={(e) => { setSendTo(e.target.value) }} value={sendTo} placeholder='Enter Room Id' />
					<input className='p-3  w-[20vw] rounded-xl text-2xl ' type="text" name='msg' onChange={(e) => { setPrivateMsg(e.target.value) }} value={privateMsg} placeholder='Enter Room Id' />
					<div><button className='p-2 text-white text-2xl bg-green-500 rounded-xl active:bg-green-800 focus:bg-green-500' type='submit' >Send To Room</button>
					</div>
				</form> */}


				<button onClick={handleLeave} className='z-40 cursor-pointer fixed top-0 left-[43vw] bg-red-500 rounded-lg p-2 text-white font-bold' >Leave Game Room {room.roomName} </button>

				{/* snake and ladder */}

				<div className='absolute left-[45vh] top-2 h-[90vh] w-[50vw]' >
					<img style={{ left: `${1.5 + 4.5 * x}rem`, top: `${2.5 + 4 * y}rem` }} className='relative z-20 h-[70px] w-[70px]' src="avatar1.png" alt="" />
					<img className='absolute z-0 h-[90vh] w-[50vw] top-12' src="s&l2.avif" alt="" />
				</div>


				{/* avatars */}


				<div className='flex flex-col ml-9  gap-10 h-screen w-[20vw]'>

					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar1.png" alt="" /></div> Srishti </div>
						<div className='  h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src="six.png" alt="" /></div>
					</div>



					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar2.png" alt="" /></div> Rishav </div>
						<div className='h-[60px] w-[60px] rounded-lg bg-white border-green-600 border-4 ' ><img src="two.png" alt="" /></div>
					</div>


					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar3.png" alt="" /></div> Raghav </div>
						<div className='h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src="five.png" alt="" /></div>
					</div>


					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar4.png" alt="" /></div> Sharadha </div>
						<div className='h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src="one.png" alt="" /></div>
					</div>
				</div>


				{/* Chatbox */}

				<div className='absolute right-0 top-0 bg-[#001455] h-screen w-[27vw] '>

					<div className='h-[86vh] overflow-y-scroll' >
						<div className='text-white' >
							<h2>Messages:</h2>
							{room.messages.map((msg, index) => (
								<div className='my-3' key={index}>
									<div className='flex' ><img width={25} src="avatar1.png" alt="" />{msg.user}</div>
									<div className='mx-7'>{msg.message}</div>
								</div>
							))}
						</div>
					</div>


					<div className='w-[25vw] ml-1'>

						<form className='h-0 m-0 p-0' onSubmit={sendMessageToRoom}>
							<input
								className=' rounded-lg p-3 w-[25vw] outline-none'
								type="text"
								name='msg'
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Enter message"
							/>
							<button type='submit' name='msg' className='relative bottom-12 left-[22vw] bg-green-500 p-3 rounded-e-lg text-white '>Send</button>
						</form>
					</div>
				</div>


			</div>
		</>
	)
}

export default Room
