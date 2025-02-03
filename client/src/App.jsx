import React, { useEffect, useState } from 'react';
import {
	BrowserRouter,
	Link,
	Route,
	Routes,
  } from "react-router-dom";
import './App.css'
import Entry from './assets/Entry';
import Room from './assets/Room';
import Joining from './assets/Joining';
import VideoCall from './assets/Video';


function App() {

	return (

	<BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/joining" element={<Joining />} />
        <Route path="/room" element={<Room />} />
        <Route path="/video" element={<VideoCall />} />
      </Routes>
    </BrowserRouter>

	);
}

export default App
