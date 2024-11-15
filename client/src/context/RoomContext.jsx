import React, { createContext, useState, useEffect, useContext } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [room, setRoom] = useState({
        roomName: '',
        users: [],
        messages: []
    });

    useEffect(() => {
        // Load room from localStorage on mount
        setRoomToState();
    }, []);

    const setRoomToState = () => {
        const savedRoom = localStorage.getItem('Room');
        setRoom(savedRoom ? JSON.parse(savedRoom) : {
            roomName: '',
            users: [],
            messages: [],
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
            roomName: '',
            users: [],
            messages: []
        });  // Reset state to initial values
        localStorage.removeItem("Room");  // Clear from localStorage
    };

    return (
        <RoomContext.Provider
            value={{ room, setRoomName, addUser, addMessage, clearRoom, removeUser }}
        >
            {children}
        </RoomContext.Provider>
    );
};

// Custom hook to use RoomContext
export const useRoom = () => useContext(RoomContext);
