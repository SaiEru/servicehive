import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Requests from './pages/Requests'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './auth/AuthContext'

function App() {
  const { user, logout } = useAuth()
  return (
    <div>
      <nav className="nav">
        <Link to="/">Dashboard</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/requests">Requests</Link>
        <span className="nav-right">
          {user ? (
            <>
              <span style={{ opacity: 0.8 }}>Hi, {user.name}</span>
              <button className="btn-ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <span style={{ opacity: 0.4 }}>|</span>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </span>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
