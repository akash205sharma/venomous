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
            user_2: { user_name: "JaneDoe", id: 2 }
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

