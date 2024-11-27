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
	const { room, setRoomName, addUser, addMessage, clearRoom, removeUser, setGame } = useRoom();
	const [message, setMessage] = useState("")
	const navigate = useNavigate();

	useEffect(() => {

		joinRoom(room.roomName);    /******** Very imp for Now ********/

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






	const scores = room.game.scores;
	const [turn, setTurn] = useState(0);

	const dicefaces = ["one", "two", "three", "four", "five", "six"];
	const [Dice, setDice] = useState([1, 1, 1, 1]);
	const changeDiceValue = (value, turn) => {
		let newDiceValues = Dice;
		newDiceValues[turn] = value;
		console.log(Dice);
		setDice(newDiceValues);
	}


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
		[[9, 0], 0], [[8, 0], 0], [[7, 0], 0], [[6, 0], 0], [[5, 0], -18], [[4, 0], 0], [[3, 0], 0], [[2, 0], 0], [[1, 0], 0], [[0, 0], 0],

	]



	const diceMove = () => {
		const Dicevalue = Math.floor(1 + Math.random() * 6);
		// const Dicevalue = 1;

		changeDiceValue(Dicevalue, turn);
		//Dice rolling
		let myscore = Dicevalue + scores[turn];
		if (myscore <= 99) {
			setGame(myscore, turn);
		}

		setTimeout(() => {
			if (Grid[Dicevalue + scores[turn]][1] != 0) {
				let myscore = Grid[Dicevalue + scores[turn]][1] + Dicevalue + scores[turn];
				if (myscore <= 99) {
					setGame(myscore, turn);
				}
			}
		}, 1500);

		console.log(Dicevalue)

		if (turn < 3) setTurn(turn + 1);
		else setTurn(0);

	}


	// const stop=0;
	// const play=(e) => {
	//   e.preventDefault();
	//   while(!stop){

	//   }
	// }




	// setTimeout(() => {
	// 	setGame([1,2,5,4],[1,0,5,3]);
	// }, 3000);

	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover bg-center bg h-[100vh]'>


				<button className='z-40 cursor-pointer fixed top-0 left-[43vw] bg-green-500 rounded-lg p-2 text-white font-bold' >PLAY{room.roomName} </button>
				<button onClick={handleLeave} className='z-40 cursor-pointer fixed top-0 left-[43vw] bg-red-500 rounded-lg p-2 text-white font-bold' >Leave Game Room {room.roomName} </button>

				{/* snake and ladder */}

				<div className='absolute left-[45vh] top-2 h-[90vh] w-[50vw]' >
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[0]][0][0]}rem`, top: `${7 + 4 * (Grid[scores[0]][0][1] - 1)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar1.png" alt="" />
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[1]][0][0]}rem`, top: `${2.5 + 4 * (Grid[scores[1]][0][1] - 1)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar2.png" alt="" />
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[2]][0][0]}rem`, top: `${2.5 + 4 * (Grid[scores[2]][0][1] - 2)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar3.png" alt="" />
					<img style={{ left: `${1.5 + 4.5 * Grid[scores[3]][0][0]}rem`, top: `${2.5 + 4 * (Grid[scores[3]][0][1] - 3)}rem` }} className='transition-position relative z-20 h-[70px] w-[70px]' src="avatar4.png" alt="" />


					<img className='absolute z-0 h-[90vh] w-[50vw] top-12 ' src="s&l2.avif" alt="" />
				</div>


				{/* avatars */}


				<div className='flex flex-col ml-9  gap-10 h-screen w-[20vw]'>

					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar1.png" alt="" /></div> Srishti </div>
						{(turn == 0) && <div onClick={diceMove} className='  h-[60px] w-[60px] rounded-lg bg-white border-green-600 border-4 ' ><img src={`${dicefaces[Dice[0] - 1]}.png`} /></div>}
						{(turn != 0) && <div className='  h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src={`${dicefaces[Dice[0] - 1]}.png`} /></div>}
					</div>



					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar2.png" alt="" /></div> Rishav </div>

						{(turn == 1) && <div onClick={diceMove} className='  h-[60px] w-[60px] rounded-lg bg-white border-green-600 border-4 ' ><img src={`${dicefaces[Dice[0] - 1]}.png`} /></div>}
						{(turn != 1) && <div className='  h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src={`${dicefaces[Dice[1] - 1]}.png`} /></div>}
					</div>


					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar3.png" alt="" /></div> Raghav </div>
						{(turn == 2) && <div onClick={diceMove} className='  h-[60px] w-[60px] rounded-lg bg-white border-green-600 border-4 ' ><img src={`${dicefaces[Dice[2] - 1]}.png`} /></div>}
						{(turn != 2) && <div className='  h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src={`${dicefaces[Dice[2] - 1]}.png`} /></div>}
					</div>


					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar4.png" alt="" /></div> Sharadha </div>
						{(turn == 3) && <div onClick={diceMove} className='  h-[60px] w-[60px] rounded-lg bg-white border-green-600 border-4 ' ><img src={`${dicefaces[Dice[3] - 1]}.png`} /></div>}
						{(turn != 3) && <div className='  h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src={`${dicefaces[Dice[3] - 1]}.png`} /></div>}
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
