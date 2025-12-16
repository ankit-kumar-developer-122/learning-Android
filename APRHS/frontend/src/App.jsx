import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NewVisitPage from './pages/NewVisitPage'
import VisitsListPage from './pages/VisitsListPage'
import VisitDetailPage from './pages/VisitDetailPage'
import DashboardPage from './pages/DashboardPage'
import ChatbotPage from './pages/ChatbotPage'
import './styles/App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🏥 APRHS
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/visits" className="nav-link">Visits</Link>
              </li>
              <li className="nav-item">
                <Link to="/new-visit" className="nav-link">New Visit</Link>
              </li>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/chatbot" className="nav-link">Symptom Checker</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/visits" element={<VisitsListPage />} />
            <Route path="/new-visit" element={<NewVisitPage />} />
            <Route path="/visit/:id" element={<VisitDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>© 2024 APRHS - AI-Powered Rural Healthcare System</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
