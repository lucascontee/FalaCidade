import { Outlet, Route, Routes } from 'react-router-dom'

import './App.css'

import { LoginScreen } from './pages/login/loginScreen'
import { OccurrencesFeed } from './pages/occurrence/ocurrenceFeed'
import { OccurrenceEditor } from './pages/occurrence/occurrenceEditor'
import { Sidebar } from './layouts/sidebar'

function AuthenticatedLayout() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 pl-16 w-full">
        <Outlet /> 
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />

      <Route element={<AuthenticatedLayout />}>
        <Route path="/feed" element={<OccurrencesFeed />} />
        <Route path="/occurrence" element={<OccurrenceEditor />} />
        
        <Route path="/minhas-ocorrencias" element={
          <div className="p-8"><h1 className="text-2xl font-bold">Minhas Ocorrências (Em breve)</h1></div>
        } />
      </Route>
    </Routes>
  );
}

export default App
