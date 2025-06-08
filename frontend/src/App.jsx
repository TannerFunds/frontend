import { useState, useEffect } from 'react'
import './App.css'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Authentication
  const login = async () => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('username', 'demo')
      formData.append('password', 'demo')
      
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setToken(data.access_token)
        localStorage.setItem('token', data.access_token)
        setIsAuthenticated(true)
        setError(null)
      } else {
        setError('Login failed')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch facilities
  const fetchFacilities = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/facilities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFacilities(data)
        setError(null)
      } else {
        setError('Failed to fetch facilities')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create sample facility
  const createSampleFacility = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const sampleFacility = {
        name: `Sample Facility ${Date.now()}`,
        location: "Sample Location, Country",
        type: "Tailings Dam",
        owner: "Sample Mining Company",
        status: "active"
      }
      
      const response = await fetch(`${API_BASE_URL}/facilities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sampleFacility)
      })
      
      if (response.ok) {
        await fetchFacilities()
        setError(null)
      } else {
        setError('Failed to create facility')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true)
      fetchFacilities()
    }
  }, [token])

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🏗️ TailingsIQ</h1>
          <p>Tailings Management System</p>
          
          {error && (
            <div className="error-alert">
              ⚠️ {error}
            </div>
          )}
          
          <p className="demo-info">
            Demo credentials: username: demo, password: demo
          </p>
          
          <button 
            onClick={login} 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Connecting...' : 'Login to TailingsIQ'}
          </button>
        </div>
      </div>
    )
  }

  // Main application
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🏗️ TailingsIQ</h1>
          <div className="header-actions">
            <span className="demo-badge">Demo Mode</span>
            <button 
              onClick={() => {
                localStorage.removeItem('token')
                setIsAuthenticated(false)
                setToken(null)
              }}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {error && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total Facilities</h3>
            <div className="metric-value">{facilities.length}</div>
            <p className="metric-label">Active monitoring sites</p>
          </div>

          <div className="dashboard-card">
            <h3>Risk Level</h3>
            <div className="metric-value risk-medium">Medium</div>
            <p className="metric-label">Overall system risk</p>
          </div>

          <div className="dashboard-card">
            <h3>Active Alerts</h3>
            <div className="metric-value risk-high">2</div>
            <p className="metric-label">Require attention</p>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="section-card">
          <div className="section-header">
            <h2>Facilities Management</h2>
            <button 
              onClick={createSampleFacility} 
              disabled={loading}
              className="add-button"
            >
              ➕ Add Sample Facility
            </button>
          </div>

          {facilities.length > 0 ? (
            <div className="facilities-grid">
              {facilities.map((facility) => (
                <div key={facility.id} className="facility-card">
                  <div className="facility-header">
                    <h3>{facility.name}</h3>
                    <span className={`status-badge ${facility.status}`}>
                      {facility.status}
                    </span>
                  </div>
                  <p className="facility-location">{facility.location}</p>
                  <p><strong>Type:</strong> {facility.type}</p>
                  <p><strong>Owner:</strong> {facility.owner}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏗️</div>
              <p>No facilities found. Add a sample facility to get started.</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="section-card">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span>API Status</span>
              <span className="status-badge online">Online</span>
            </div>
            <div className="status-item">
              <span>Database</span>
              <span className="status-badge online">Connected</span>
            </div>
            <div className="status-item">
              <span>AI Services</span>
              <span className="status-badge online">Available</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

