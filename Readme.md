Venomous - The Snake Game

This is an online multiplayer Snake Game 

Fetures Includes 
    1. Create Rooms and Invite Friends to join and play.
    2. Chat with Players
    3. Interact With Players Using Video Calls (Multiple players supported).


Architecture
    1. LocalStorage & Context Api for RoomId, UserId.
    2. joinroom in useEffect,
    3. Array for positions.
    4. For dice logic , amp for position(x,y) to score.
    room: {
        game: {
            turn: 0,
            scores: [0, 0, 0, 0],
        },
        roomName: '',
        users: {
            user_1: { user_name: "akash"}
            user_2: { user_name: "JaneDoe" }
        },
        messages: []
    }

DICE LOGIC{
    kiski baari hai state = turn ;

    const dicefaces = ["one", "two", "three", "four", "five", "six"];  for image of dice
     
    Dice = useState([1,1,1,1]) 
    above is for storing which dice have what value and to change value of that dice only for showing dice face

}





Challenges I faced
    1. Making different tabs as single user.
    2. transition for position change transition-position handeled by it self.
    3. how to Know which user is moving dice and changing position.
    3. Changing turn of players, which player to move
    4. Double click on dice{
        is clickable state and isrolling state;
    }
    5. sockey again and again conneccting with new ids so implemented sessionStorage based userid to make that session stable  
    

    
	useEffect(() => {
		if(room.roomName !="")      // as on refresh the room was becoming empty for a second before loading from loacalstorage and at that time it was sending that empty room
	  sendRoom();

	}, [room.game.turn])

    


1. welcome -> setLocalUUID(userId)

2. startstream()
        createPeer()
            socket.emit('ice')
            socket.emit('peerconnect')
 //server//      handleTrackEvent()
                    broadcast.emit('newProducer')
                socket.emit('answer')
        consumeAll() -> socket.emit('getPeers')


//client//{
    socket.on('newProducer', handleNewProducer)
        consume()
            handleConsumerIceCandidate
                socket.emit('consumer_ice')
            socket.emit('consume')

    socket.on('answer', handleAnswer)
}



//server{
    socket.on('consumer_ice')

    socket.on('consume')
        createPeer()
        socket.emit('consume')

    socket.on('getPeers')
        socket.emit('peers', peers)
}

//client//{
    socket.on('consume', handleConsume);
    socket.on('peers', handlePeers)
        consume(peer)
            socket.emit('consume')
}

//server//{
    
}










implementation
client:ice      //
client :peerconnect  //
client: getPeers  //
client:consume   //
client:consume_ice   //


server:answer  //
server:peers   //
server:consume //



