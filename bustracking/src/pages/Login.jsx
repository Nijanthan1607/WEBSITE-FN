import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, getUsersByRole } from '../firebase'
import DatabaseInit from '../components/DatabaseInit'

function Login() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState(null)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    const { email, password } = credentials

    try {
      setIsLoading(true)
      setError('')

      // First, authenticate with Firebase
      const { user, error: loginError } = await loginUser(email, password)
      
      if (loginError) {
        throw new Error(loginError)
      }

      // Then, verify user role
      const { users, error: userError } = await getUsersByRole(selectedType)
      
      if (userError) {
        console.error('Error getting user role:', userError);
        throw new Error(userError)
      }

      const userWithRole = users.find(u => u.email === email)
      if (!userWithRole) {
        console.error('User not found in Firestore with role:', selectedType);
        throw new Error('User not found with selected role. Please make sure you have initialized the database.')
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        role: selectedType,
        ...userWithRole
      }))

      // Navigate to appropriate dashboard
      navigate(`/${selectedType}`)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setCredentials({ email: '', password: '' })
    setError('')
  }

  return (
    <>
      <div className="login-container">
        <h2>Login</h2>
      
      {!selectedType ? (
        // User type selection
        <div className="login-buttons">
          <button onClick={() => handleTypeSelect('admin')}>Admin Login</button>
          <button onClick={() => handleTypeSelect('student')}>Student Login</button>
          <button onClick={() => handleTypeSelect('faculty')}>Faculty Login</button>
          <button onClick={() => handleTypeSelect('driver')}>Driver Login</button>
        </div>
      ) : (
        // Login form for selected type
        <div className="login-form-container">
          <h3>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Login</h3>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={e => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={e => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-buttons">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedType(null)} 
                className="back-button"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    <DatabaseInit />
    </>
  )
}

export default Login