import React, { createContext, useState, useEffect, useContext } from 'react';

const RoomContext = createContext();
const storage = sessionStorage
// const storage = localStorage

export const RoomProvider = ({ children }) => {
    const [room, setRoom] = useState({
        game: {
            turn: 0,
            scores: [0, 0, 0, 0],
        },
        roomName: '',
        users: {},
        messages: []
    });

    useEffect(() => {
        // Load room from storage on mount
        setRoomToState();
    }, []);


    const updateRoom = (newRoom) => {
        storage.setItem("Room", JSON.stringify(newRoom));
        setRoom(newRoom);
    }


    const setRoomToState = () => {
        const savedRoom = storage.getItem('Room');
        setRoom(savedRoom ? JSON.parse(savedRoom) : {
            game: {
                turn: 0,
                scores: [0, 0, 0, 0],
            },
            roomName: '',
            users: {},
            messages: [],
        });
    };

    const setTurn = (turn) => {
        setRoom(prevRoom => {
            let scores = room.game.scores;
            const updatedRoom = { ...prevRoom, game: { turn, scores } };
            storage.setItem("Room", JSON.stringify(updatedRoom));
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
            storage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };

    const setRoomName = (newRoomName) => {
        setRoom(prevRoom => {
            const updatedRoom = { ...prevRoom, roomName: newRoomName };
            storage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };
    const setUsers = (users) => {
        const transformedUsers = Object.fromEntries(
            Object.entries(users).map(([key, value]) => [
                key,
                {
                    user_name: value[1],
                    // id: value[1],
                },
            ])
        );

        setRoom((prevRoom) => ({
            ...prevRoom,
            users: transformedUsers,
        }));
    };


    const addUser = ({ userId, user }) => {
        setRoom(prevRoom => {
            // Update the users array with the new user
            const updatedRoom = {
                ...prevRoom,
                users: {
                    ...prevRoom.users,
                    [userId]: user
                }
            }; storage.setItem("Room", JSON.stringify(updatedRoom));
            return updatedRoom;
        });
    };
    

    // Function to remove a particular user from users array
    const removeUser = (userId) => {
        setRoom(prevRoom => {
            // Create a copy of the current users object
            const updatedUsers = { ...prevRoom.users };

            // Remove the user with the specified userId
            delete updatedUsers[userId];

            // Update the room with the modified users object
            const updatedRoom = {
                ...prevRoom,
                users: updatedUsers
            };
            storage.setItem("Room", JSON.stringify(updatedRoom));

            return updatedRoom;
        });
    };


    const addMessage = (user, message) => {
        const newMessage = { user, message, date: Date.now() };
        setRoom(prevRoom => {
            const updatedRoom = { ...prevRoom, messages: [...prevRoom.messages, newMessage] };
            storage.setItem("Room", JSON.stringify(updatedRoom));
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
            users: {},
            messages: []
        });  // Reset state to initial values
        storage.removeItem("Room");  // Clear from storage
    };

    return (
        <RoomContext.Provider
            value={{ room, updateRoom, setRoomName, addUser,setUsers, addMessage, clearRoom, removeUser, setScore, setTurn }}
        >
            {children}
        </RoomContext.Provider>
    );
};

// Custom hook to use RoomContext
export const useRoom = () => useContext(RoomContext);
