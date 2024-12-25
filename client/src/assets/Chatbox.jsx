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

            {/* 
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
            </div> */}




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
                                        <img width={25} src="avatar1.png" alt="" />
                                        <span className="font-semibold">{msg.user}</span>
                                    </div>
                                    <div className="ml-6">{msg.message}</div>
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
