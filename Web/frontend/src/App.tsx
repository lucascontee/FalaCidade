import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import './App.css'  

import { LoginPage } from './pages/Login/LoginPage'
import { OccurrencesFeed } from './pages/Occurrence/OcurrenceFeed'
import { OccurrenceEditor } from './pages/Occurrence/OccurrenceEditor'
import { MyOccurrences } from './pages/Occurrence/MyOccurrencesPage'

import { Sidebar } from './layouts/sidebar'
import { RegisterUserPage } from './pages/RegisterUser/RegisterUserPage'
import { UserManagePage} from './pages/UserManager/UserManagerPage'
import { useAuth } from './contexts/authContext'
import { OccurrenceManagePage } from './pages/Occurrence/OccuranceManagePage'
import { NotificationPage } from './pages/Notification/NotificationPage'
import { OccurrenceDetailsPage } from './pages/Occurrence/OccurrenceDetailPage'
import { CategoryCreate } from './pages/Category/CategoryCreate'

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
  const { user } = useAuth(); 
  
  if (!user || user.role !== UserRole.Admin) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 pl-16 w-full">
        <Outlet /> 
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterUserPage />} />

      <Route element={<AuthenticatedLayout />}>
        <Route path="/feed" element={<OccurrencesFeed />} />
        <Route path="/occurrence" element={<OccurrenceEditor />} />
        <Route path="/myoccurrences" element={<MyOccurrences />} />
        <Route path="/ocurrencemanage" element={<OccurrenceManagePage />} />
        <Route path="/notificacoes" element={<NotificationPage />} />
        <Route path="/occurrence/:id" element={<OccurrenceDetailsPage />} />
        <Route path="/category" element={<CategoryCreate />} />
      </Route>

      <Route element={<AdminRoute />}>
       <Route path="/users" element={<UserManagePage />} />
      </Route>
    </Routes>
  );
}

export default App
