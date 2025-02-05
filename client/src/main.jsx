import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { GlobalProvider } from '../GlobalProvider.jsx'
import { RoomProvider } from "./context/RoomContext"
import { StreamsProvider } from './context/StreamsContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <RoomProvider>
    <StreamsProvider>
      <App />
    </StreamsProvider>
  </RoomProvider>

  // </StrictMode>,
)
