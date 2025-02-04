import React, { createContext, useState, useEffect, useContext } from 'react';

const StreamsContext = createContext();
const storage = sessionStorage

export const StreamsProvider = ({ children }) => {
    const [streams, setStreams] = useState({
        localstream: null,
        remotestreams: [],
    });

    // useEffect(() => {
    //     // Load streams from storage on mount
    //     setStreamsToState();
    // }, []);

    // const updateStreams = (newStreams) => { 
    //     storage.setItem("Streams", JSON.stringify(newStreams));
    //     setStreams(newStreams);
    // }

    const setStreamsToState = () => {
        const savedStreams = storage.getItem('Streams');
        setStreams(savedStreams ? JSON.parse(savedStreams) : {
            localstream: null,
            remotestreams: [],
        });
    };

    const addLocalStream = (localstream) => {
        setStreams(prevStreams => {
            const updatedStreams = { ...prevStreams, localstream };
            // storage.setItem("Streams", JSON.stringify(updatedStreams));
            return updatedStreams;
        });
    };


    // const addRemoteStream = (stream,username) => {   
    //     setStreams(prevStreams => {
    //         const updatedStreams = { ...prevStreams, remotestreams: [...prevStreams.remotestreams, stream] };
    //         storage.setItem("Streams", JSON.stringify(updatedStreams));
    //         return updatedStreams;
    //     });
    // }
    
    const addRemoteStream = (stream,username) => {   
        setStreams(prevStreams => {
            const existingIndex = prevStreams.remotestreams.findIndex(s => s.username === username);

            if (existingIndex !== -1) {
                const updatedStreams = { ...prevStreams, remotestreams: [...prevStreams.remotestreams] };

                console.log("remote stream context" ,updatedStreams.remotestreams[existingIndex].stream);

                updatedStreams.remotestreams[existingIndex]?.stream?.addTrack(stream.getTracks()[0]);
                // storage.setItem("Streams", JSON.stringify(updatedStreams));
                return updatedStreams;
            } else {
                const updatedStreams = { ...prevStreams, remotestreams: [...prevStreams.remotestreams, { stream, username }] };
                // storage.setItem("Streams", JSON.stringify(updatedStreams));
                return updatedStreams;
            }
        });
    }



    return (
        <StreamsContext.Provider value={{ streams, setStreams, addLocalStream, addRemoteStream }}>
            {children}
        </StreamsContext.Provider>
    );
};

export const useStreams = () => useContext(StreamsContext);