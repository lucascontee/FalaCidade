import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import './App.css'

import { LoginPage } from './pages/Login/LoginPage'
import { OccurrencesFeed } from './pages/Occurrence/OcurrenceFeed'
import { OccurrenceEditor } from './pages/Occurrence/OccurrenceEditor'
import { MyOccurrences } from './pages/Occurrence/MyOccurrencesPage'

import { Sidebar } from './layouts/sidebar'
import { RegisterPage } from './pages/Register/RegisterPage'
import { UserManagePage} from './pages/UserManager/UserManagerPage'
import { useAuth } from './context/authContext'

const UserRole = {
  Citizen: 0,
  Reviewer: 1,
  Admin: 2
};

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

function AdminRoute() {
  const { user } = useAuth(); // Se tiver um loading no contexto, use aqui

  if (!user || user.role !== UserRole.Admin) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AuthenticatedLayout />}>
        <Route path="/feed" element={<OccurrencesFeed />} />
        <Route path="/occurrence" element={<OccurrenceEditor />} />
        <Route path="/myoccurrences" element={<MyOccurrences />} />
      </Route>

      <Route element={<AdminRoute />}>
       <Route path="/users" element={<UserManagePage />} />
      </Route>
    </Routes>
  );
}

export default App
