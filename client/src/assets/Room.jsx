import React, { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useCallback } from 'react';
import ReactPlayer from 'react-player'
import peer from '../services/peer';
import Chatbox from './Chatbox';


const storage = sessionStorage   //a tab a user
// const storage = localStorage   // different tabs same user

// const socket = io('http://localhost:4000');

// For making different tab as same user

// const socket = io('http://localhost:4000')

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

// console.log(socket);







function Room() {

	const { room, updateRoom, setScore, setTurn, setRoomName, addUser, addMessage, clearRoom, removeUser } = useRoom();
	const [message, setMessage] = useState("")
	const user_name = room.users[userId]?.user_name;
	const navigate = useNavigate();


	// Join a room
	const joinRoom = (roomName) => {
		socket.emit('join_room', roomName);
	};

	// Leave a room
	const leaveRoom = (roomName) => {
		socket.emit('leave_room', roomName);
	};

	const sendRoom = () => {
		socket.emit('send_room', room);
	}


	useEffect(() => {

		joinRoom({ roomName: room.roomName, user_name });    /******** Very imp for Now ********/

	}, [room.roomName, user_name])



	// update if one user leaveRoom///????

	useEffect(() => {

		//Listen for incoming room
		socket.on('receive_room', ({ room, sender }) => {
			console.log(room, "Room data updated");
			updateRoom(room);
		});

		return () => {
			socket.off('receive_room');
		};

	}, [socket])   //room or socket

	useEffect(() => {
		if (room.roomName != "")      // as on refresh the room was becoming empty for a second before loading from loacalstorage and at that time it was sending that empty room
			sendRoom();

	}, [room.game.turn])



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
		// const users = room.users;
		// joinRoom(roomName);
		socket.emit('send_message', { roomName, message });
		setMessage('');
		// console.log('Rooms the svocket is part of:', socket.room);
	};



	const handleLeave = (e) => {
		e.preventDefault();
		leaveRoom(room.roomName);  // Ensure this function works as intended
		clearRoom();    // deleting from my localstorage only 
		navigate("/");      // Navigate back to the home page
	};


	const dicefaces = ["one", "two", "three", "four", "five", "six"];
	const [Dice, setDice] = useState(1);


	const Grid = [
		[[0, 9], 0], [[1, 9], 0], [[2, 9], 0], [[3, 9], 21], [[4, 9], 0], [[5, 9], 0], [[6, 9], 0], [[7, 9], 0], [[8, 9], 0], [[9, 9], 0],
		[[9, 8], 0], [[8, 8], 0], [[7, 8], 33], [[6, 8], 0], [[5, 8], 0], [[4, 8], 0], [[3, 8], 0], [[2, 8], 0], [[1, 8], 0], [[0, 8], 0],
		[[0, 7], 0], [[1, 7], 0], [[2, 7], 0], [[3, 7], 0], [[4, 7], 0], [[5, 7], 0], [[6, 7], -22], [[7, 7], 0], [[8, 7], 0], [[9, 7], 0],
		[[9, 6], 0], [[8, 6], 0], [[7, 6], 0], [[6, 6], 0], [[5, 6], 0], [[4, 6], 0], [[3, 6], 0], [[2, 6], 0], [[1, 6], 0], [[0, 6], -37],
		[[0, 5], 0], [[1, 5], 21], [[2, 5], -25], [[3, 5], 0], [[4, 5], 0], [[5, 5], 0], [[6, 5], 0], [[7, 5], 0], [[8, 5], 0], [[9, 5], 19],
		[[9, 4], 0], [[8, 4], 0], [[7, 4], 0], [[6, 4], -23], [[5, 4], 0], [[4, 4], 0], [[3, 4], 0], [[2, 4], 0], [[1, 4], 0], [[0, 4], 0],
		[[0, 3], 0], [[1, 3], 19], [[2, 3], 0], [[3, 3], 0], [[4, 3], 0], [[5, 3], -21], [[6, 3], 0], [[7, 3], 0], [[8, 3], 0], [[9, 3], 0],
		[[9, 2], 0], [[8, 2], 0], [[7, 2], 0], [[6, 2], 18], [[5, 2], 0], [[4, 2], 0], [[3, 2], 0], [[2, 2], 0], [[1, 2], 0], [[0, 2], 0],
		[[0, 1], 0], [[1, 1], 0], [[2, 1], 0], [[3, 1], 0], [[4, 1], 0], [[5, 1], 0], [[6, 1], 0], [[7, 1], 0], [[8, 1], -36], [[9, 1], 0],
		[[9, 0], 0], [[8, 0], 0], [[7, 0], 0], [[6, 0], 0], [[5, 0], -18], [[4, 0], 0], [[3, 0], 0], [[2, 0], 0], [[1, 0], -58], [[0, 0], 0],

	]
	const scores = room.game.scores
	const turn = room.game.turn
	const [isrolling, setIsrolling] = useState(0);

	const diceMove = (e) => {
		setIsrolling(1);
		setTimeout(() => {
			const Dicevalue = Math.floor(1 + Math.random() * 6);
			// const Dicevalue = 1;
			setIsrolling(0)
			setDice(Dicevalue);
			//Dice rolling
			let myscore = Dicevalue + scores[turn];
			if (myscore <= 99) {
				setScore(myscore, turn);
				//check for snake or ladder

				setTimeout(() => {
					if (Grid[myscore][1] != 0) {
						let updatedscore = Grid[myscore][1] + myscore;
						if (updatedscore <= 99) {
							setScore(updatedscore, turn);
						}
					}
					if (turn < Object.keys(room.users).length - 1) setTurn(turn + 1);
					else setTurn(0);
					console.log(turn)

				}, 1700);
			}
			else {
				if (turn < Object.keys(room.users).length - 1) setTurn(turn + 1);
				else setTurn(0);
				console.log(turn)
			}

		}, 1200);

	}





	//{    // Video call logic

	// const [myStream, setMyStream] = useState()
	// const [remoteStream, setRemoteStream] = useState()

	// const handleCall = useCallback(async () => {
	// 	const stream = await navigator.mediaDevices.getUserMedia({
	// 		audio: true,
	// 		video: true
	// 	});
	// 	const offer = await peer.getOffer();
	// 	socket.emit("forward_call", { to: room.roomName, offer });
	// 	setMyStream(stream)
	// 	console.log("Call Forwarding started");

	// }, [room.roomName, socket]);


	// const handleIncommingCall = useCallback(async ({ from, offer }) => {
	// 	console.log("incomming_call", from, offer);

	// 	const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
	// 	setMyStream(stream)

	// 	const ans = await peer.getAnswer(offer)
	// 	socket.emit('call_accepted', { to: room.roomName, ans });

	// }, [socket]);

	// const sendStreams = useCallback(() => {
	// 	for (const track of myStream.getTracks()) {
	// 		peer.peer.addTrack(track, myStream);
	// 	}
	// }, [myStream]);

	// const handleCallAccepted = useCallback(({ from, ans }) => {
	// 	peer.setLocalDescription(ans)   // await added by myself
	// 	console.log("Call Accepted");
	// 	sendStreams();
	// }, [sendStreams]);

	// const handleNegoNeeded = useCallback(async () => {
	// 	const offer = await peer.getOffer();
	// 	socket.emit('peer_nego_needed', { offer, to: room.roomName });

	// }, [room.roomName, socket]);   //???????????????????

	// const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
	// 	const ans = await peer.getAnswer(offer);
	// 	socket.emit('peer_nego_done', { to: from, ans })
	// }, [socket])

	// const handleNegoNeedFinal = useCallback(async ({ ans }) => {
	// 	await peer.setLocalDescription(ans)
	// }, []);


	// useEffect(() => {
	// 	peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

	// 	return () => {
	// 		peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
	// 	}
	// }, [handleNegoNeeded])


	// useEffect(() => {
	// 	peer.peer.addEventListener('track', async (ev) => {
	// 		const remoteStream = ev.streams;
	// 		// console.log('got tracks', remoteStream)

	// 		setRemoteStream(remoteStream[0]);

	// 		// console.log("remoteStream",remoteStream[0])

	// 	})

	// }, []);



	// useEffect(() => {
	// 	socket.on('incomming_call', handleIncommingCall)
	// 	socket.on('call_accepted', handleCallAccepted)
	// 	socket.on('peer_nego_needed', handleNegoNeedIncomming)
	// 	socket.on('peer_nego_final', handleNegoNeedFinal)

	// 	return () => {
	// 		socket.off('incomming_call', handleIncommingCall)
	// 		socket.off('call_accepted', handleCallAccepted)
	// 		socket.off('peer_nego_needed', handleNegoNeedIncomming)
	// 		socket.off('peer_nego_final', handleNegoNeedFinal)

	// 	}
	// }, [socket, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);



	// console.log("myStream", myStream)
	// console.log("remoteStream", remoteStream)

	// console.log(turn)


	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover h-[100vh] bg-center overflow-y-scroll'>


				<button onClick={handleLeave} className='z-40 py-3 px-6 hover:bg-red-600 transition duration-300 fixed top-0 left-[43vw] bg-red-500 rounded-lg p-2 text-white font-bold' >Leave Game Room {room.roomName} </button>

				{/* snake and ladder */}

				<div className='absolute left-[45vh] top-2 h-[90vh] w-[50vw]' >
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[0]][0][0]}rem`, top: `${7.0 + 4 * (Grid[scores[0]][0][1] - 1)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar1.png" alt="" />
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[1]][0][0]}rem`, top: `${2.5 + 4 * (Grid[scores[1]][0][1] - 1)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar2.png" alt="" />
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[2]][0][0]}rem`, top: `${2.5 + 4 * (Grid[scores[2]][0][1] - 2)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar3.png" alt="" />
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[3]][0][0]}rem`, top: `${2.5 + 4 * (Grid[scores[3]][0][1] - 3)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar4.png" alt="" />

					<img className='absolute z-0 h-[90vh] w-[50vw] top-12 ' src="s&l2.avif" alt="" />
				</div>





				{/* avatars */}


				<div className='flex flex-col h-screen w-[20vw] gap-10'>
					{/* Other Users Section */}
					<div className='flex flex-col gap-6'>
						{Object.keys(room.users)
							.filter((eachUserId) => eachUserId !== userId) // Exclude current user
							.map((eachUserId, index) => {
								const user = room.users[eachUserId];
								const avatarSrc = `avatar${index + 1}.png`;
								console.log(avatarSrc)
								return (
									<div key={eachUserId} className='flex items-center gap-2'>
										<div className={`text-center text-white font-extrabold text-xl ${turn === Object.keys(room.users).indexOf(eachUserId) ? ' border-green-400 border-4 rounded-xl' : ''}  `}>
											<div className={`border-4 bg-blue-500 rounded-full p-2 `}>
												<img width={100} src={`avatar${Object.keys(room.users).indexOf(eachUserId) + 1}.png`} alt={`${user?.user_name}'s avatar`} />
											</div>
											{user?.user_name}
										</div>
									</div>
								);
							})}
					</div>

					{/* Current User Section */}
					<div className='mt-auto flex items-center justify-center gap-4'>
						<div className={`text-center text-white font-extrabold text-xl  ${turn === Object.keys(room.users).indexOf(userId) ? 'border-green-400 border-4 rounded-xl' : ''} `}>
							<div className={` border-4 bg-blue-500 rounded-full p-2 `}>
								<img width={100} src={`avatar${Object.keys(room.users).indexOf(userId) + 1}.png`} alt='Your avatar' />
							</div>
							{user_name}
						</div>

						{/* Dice */}
						<div
							onClick={turn === Object.keys(room.users).indexOf(userId) ? diceMove : null}
							className={`h-[60px] w-[60px] rounded-lg bg-white ${turn === Object.keys(room.users).indexOf(userId) ? 'border-green-600 border-4 rounded-xl' : 'border-gray-400'
								} border-4`}>
							<img src={isrolling ? 'rollingDice.gif' : `${dicefaces[Dice-1]}.png`} />
						</div>
					</div>
				</div>


				{/* Chatbox */}


				<Chatbox
					room={room}
					sendMessageToRoom={sendMessageToRoom}
					setMessage={setMessage}
					message={message}
					userId={userId}
				/>



				{/* Video Call */}
				{ <div className='absolute top-10 right-0 w-[20vw]'>
					<button onClick={handleCall} className='text-white bg-green-500 rounded m-4 px-5 py-2'>Call</button>
					{myStream && <button onClick={sendStreams} className='text-white bg-green-500 rounded m-4 px-5 py-2'>Send video</button>}
					<h1>MY Video</h1>
					{myStream && <ReactPlayer className="border border-y-black" playing height={300} width={300} url={myStream} />}
					<h1>Friend Video</h1>
					{remoteStream && <ReactPlayer className="border border-y-black" playing height={300} width={300} url={remoteStream} />}

				</div> }

				
			</div>
		</>


	)
}

export default Room