import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import HostJoin from "./pages/start/HostJoin"
import Game from './pages/Game'
import { connectSocket } from './services/socketService'

function App() {
  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <BrowserRouter>
      <div className='min-h-screen text-gray-800 font-spc'>
        <Routes>
          <Route path="/" element={<HostJoin />} />
          <Route path="/game/:roomId" element={<Game />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
