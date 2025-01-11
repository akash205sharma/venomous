import React from 'react'
import { useState } from 'react';


const Chatbox = ({room,sendMessageToRoom,setMessage,message}) => {


    
    const [isChatboxOpen, setIsChatboxOpen] = useState(true);
    
    const toggleChatbox = () => {
        setIsChatboxOpen(!isChatboxOpen);
    };


    return (
        <div>

            {/* Chatbox */}

            {/* Chatbox Toggle Button */}
            <button
                onClick={toggleChatbox}
                className={`absolute top-2 right-2 bg-blue-500 text-white px-3 py-2 rounded ${isChatboxOpen ? "rounded-br-none" : "rounded"
                    } z-50`}
            >
                {isChatboxOpen ? "Hide Chat" : "Show Chat"}
            </button>

            {/* Chatbox */}
            {isChatboxOpen && (
                <div className="absolute right-0 top-0 bg-[#001455] h-screen w-[27vw] transition-transform">
                    <div className="h-[86vh] overflow-y-scroll p-4">
                        <div className="text-white">
                            <h2 className="text-lg font-bold mb-4">Messages:</h2>
                            {room.messages.map((msg, index) => (
                                <div className="my-3" key={index}>
                                    <div className="flex items-center gap-2">
                                        {/* <img width={25} src="avatar1.png" alt="" /> */}
                                        <img width={35} src={`avatar${Object.keys(room.users).indexOf(msg.user) + 1}.png`} alt="" />
                                        <span className="font-semibold">{room.users[msg.user].user_name}</span>
                                    </div>
                                    <div className="ml-12">{msg.message}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4">
                        <form className="flex items-center" onSubmit={sendMessageToRoom}>
                            <input
                                className="flex-1 rounded-lg p-3 outline-none bg-gray-100 text-gray-800"
                                type="text"
                                name="msg"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter message"
                            />
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 ml-2 px-4 py-2 rounded-lg text-white"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chatbox






