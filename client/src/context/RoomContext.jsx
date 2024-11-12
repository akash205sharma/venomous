"use client";

import { useNavigate } from 'react-router-dom';
import { createContext, useState, useEffect } from "react"
const RoomContext = createContext()

export const RoomProvider = ({ children }) => {
    const [Room, setRoom] = useState("")

    useEffect(() => {
        setRoomToState()
    }, [])

    const setRoomToState = () => {
        setRoom(
            localStorage.getItem('Room')
                ? localStorage.getItem('Room')
                : []
        )
    }

    const SetRoomId = async (room) => {

        localStorage.setItem("Room", room );
        // Update the state to reflect the changes in the UI
        setRoom(room);

    }

    return (
        <RoomContext.Provider
            value={{ Room, SetRoomId}}
        >
            {children}
        </RoomContext.Provider>
    );
};

export default RoomContext;