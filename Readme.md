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

    

