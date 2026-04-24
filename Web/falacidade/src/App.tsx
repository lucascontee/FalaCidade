import { Route, Routes } from 'react-router-dom'

import './App.css'

import { LoginScreen } from './pages/login/loginScreen'
function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginScreen />}>

      </Route>
    </Routes>
  )
}

export default App
