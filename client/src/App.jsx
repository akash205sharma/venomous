import React, { useEffect, useState } from 'react';
import {
	BrowserRouter,
	Link,
	Route,
	Routes,
  } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Entry from './assets/Entry';
import Room from './assets/Room';


function App() {

	return (

	<BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>

	);
}

export default App
