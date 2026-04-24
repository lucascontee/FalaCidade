import { Outlet, Route, Routes } from 'react-router-dom'

import './App.css'

import { LoginPage } from './pages/Login/LoginPage'
import { OccurrencesFeed } from './pages/Occurrence/OcurrenceFeed'
import { OccurrenceEditor } from './pages/Occurrence/OccurrenceEditor'
import { MyOccurrences } from './pages/Occurrence/MyOccurrencesPage'

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
      <Route path="/" element={<LoginPage />} />

      <Route element={<AuthenticatedLayout />}>
        <Route path="/feed" element={<OccurrencesFeed />} />
        <Route path="/occurrence" element={<OccurrenceEditor />} />
        <Route path="/myoccurrences" element={<MyOccurrences />} />
      </Route>
    </Routes>
  );
}

export default App
