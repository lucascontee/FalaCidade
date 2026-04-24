import { Route, Routes } from 'react-router-dom'

import './App.css'

import { LoginScreen } from './pages/login/loginScreen'
import { OccurrencesFeed } from './pages/feed/ocurrencesFeed'
function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginScreen />}/>
      <Route path="/feed" element={<OccurrencesFeed />} /> 
    </Routes>
  )
}

export default App
