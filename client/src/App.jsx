import React, { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { io } from 'socket.io-client';
import './App.css'
const socket = io('http://localhost:4000');

function App() {

	const savedMessages = JSON.parse(localStorage?.getItem('messages'));
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState(savedMessages ? savedMessages : []);


	// Join a room
	const joinRoom = (roomName) => {
		socket.emit('join_room', roomName);
	};

	// Leave a room
	const leaveRoom = (roomName) => {
		socket.emit('leave_room', roomName);
	};


	// Listen for incoming messages from the room
	useEffect(() => {
		socket.on('receive_message', (data) => {   // here data is data.sender and data.message
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages, data.message];
				localStorage.setItem('messages', JSON.stringify(updatedMessages)); // Update localStorage with new messages
				return updatedMessages;
			});
		});
	}, []);

	
	// 	// Emit data to server
	// const sendMessage = (event) => {
	// 	event.preventDefault();
	// 	socket.emit('send_data', message);
	// 	setMessage('');
	// };

	const roomName="Family";

	joinRoom("Family")

	// Send a message to a specific room
	const sendMessageToRoom = (e) => {
		e.preventDefault();
		socket.emit('send_message', { roomName, message });
		setMessage('');
	};




	let x = 9;
	let y = 9;


	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover bg-center bg h-[100vh]'>


				{/* snake and ladder */}

				<div className='absolute left-[45vh] h-[90vh] w-[50vw] mb-[-6px] ' >
					<img style={{ left: `${1.5 + 4.5 * x}rem`, top: `${2.5 + 4 * y}rem` }} className='relative z-20 h-[70px] w-[70px]' src="avatar1.png" alt="" />
					<img className='absolute z-0 h-[90vh] w-[50vw] top-10' src="s&l2.avif" alt="" />
				</div>


				{/* avatars */}


				<div className='flex flex-col ml-9  gap-10 h-screen'>

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
							{messages.map((msg, index) => (
								<div className='my-3' key={index}>
									<div className='flex' ><img width={25} src="avatar1.png" alt="" />Akash</div>
									<div className='mx-7'>{msg}</div>
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

export default App
