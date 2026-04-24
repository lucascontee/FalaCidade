import { Route, Routes } from 'react-router-dom'

import './App.css'

import { LoginScreen } from './pages/login/loginScreen'
import { OccurrencesFeed } from './pages/occurrence/ocurrenceFeed'
import { OccurrenceEditor } from './pages/occurrence/occurrenceEditor'
function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginScreen />}/>
      <Route path="/feed" element={<OccurrencesFeed />} /> 
      <Route path="/newoccurrence" element={<OccurrenceEditor />} />
    </Routes>
  )
}

export default App
