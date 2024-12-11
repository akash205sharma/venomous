import React, { createContext, useState, useEffect, useContext } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [room, setRoom] = useState({
        game: {
            turn: 0,
            scores: [0, 0, 0, 0],
        },
        roomName: '',
        users: [],
        messages: []
    });

    useEffect(() => {
        // Load room from localStorage on mount
        setRoomToState();
    }, []);


    const updateRoom = (newRoom) => {
        localStorage.setItem("Room", JSON.stringify(newRoom));
        setRoom(newRoom);
    }


    const setRoomToState = () => {
        const savedRoom = localStorage.getItem('Room');
        setRoom(savedRoom ? JSON.parse(savedRoom) : {
            game: {
                turn: 0,
                scores: [0, 0, 0, 0],
            },
            roomName: '',
            users: [],
            messages: [],
        });
    };

    const setTurn = (turn) => {
        setRoom(prevRoom => {
            let scores = room.game.scores;
            const updatedRoom = { ...prevRoom, game: { turn, scores } };
            localStorage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    const setScore = (score, turn) => {
        setRoom(prevRoom => {
            let scores = room.game.scores;
            scores[turn] = score;
            const updatedRoom = {
                ...prevRoom,
                game: {
                    ...prevRoom.game,
                    scores: [...prevRoom.game.scores, scores]
                }
            };
            localStorage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    const setRoomName = (newRoomName) => {
        setRoom(prevRoom => {
            const updatedRoom = { ...prevRoom, roomName: newRoomName };
            localStorage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    const addUser = (user) => {
        setRoom(prevRoom => {
            const updatedRoom = { ...prevRoom, users: [...prevRoom.users, user] };
            localStorage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    // Function to remove a particular user from users array
    const removeUser = (userId) => {
        setRoom(prevRoom => {
            const updatedRoom = {
                ...prevRoom,
                users: prevRoom.users.filter(user => user !== userId)
            };
            localStorage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    const addMessage = (user, message) => {
        const newMessage = { user, message, date: Date.now() };
        setRoom(prevRoom => {
            const updatedRoom = { ...prevRoom, messages: [...prevRoom.messages, newMessage] };
            localStorage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    const clearRoom = () => {
        setRoom({
            game: {
                turn: 0,
                scores: [0, 0, 0, 0],
            },
            roomName: '',
            users: [],
            messages: []
        });  // Reset state to initial values
        localStorage.removeItem("Room");  // Clear from localStorage
    };

    return (
        <RoomContext.Provider
            value={{ room, updateRoom, setRoomName, addUser, addMessage, clearRoom, removeUser, setScore, setTurn }}
        >
            {children}
        </RoomContext.Provider>
    );
};

// Custom hook to use RoomContext
export const useRoom = () => useContext(RoomContext);
