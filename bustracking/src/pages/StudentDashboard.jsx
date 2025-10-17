import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function StudentDashboard() {
  // State for driver's location
  const [driverLocation, setDriverLocation] = useState({
    lat: 13.0827, // Default location (example)
    lng: 80.2707
  })
  
  // State for attendance and wait request
  const [attendance, setAttendance] = useState('not_marked')
  const [showWaitForm, setShowWaitForm] = useState(false)
  const [waitMinutes, setWaitMinutes] = useState(5)
  const [waitRequestSent, setWaitRequestSent] = useState(false)

  // Simulated driver location updates (replace with your backend integration)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate location updates - replace with actual data from your backend
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Handle attendance marking
  const markAttendance = (status) => {
    setAttendance(status)
    // Here you would typically send this to your backend
    alert(`Attendance marked as ${status}`)
  }

  // Handle wait request
  const sendWaitRequest = (e) => {
    e.preventDefault()
    setWaitRequestSent(true)
    // Here you would typically send this to your backend
    alert(`Wait request sent for ${waitMinutes} minutes`)
    setShowWaitForm(false)
  }

  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      
      {/* Map Section */}
      <div className="map-container">
        <h3>Bus Location</h3>
        <MapContainer
          center={[driverLocation.lat, driverLocation.lng]}
          zoom={13}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>
              Bus is here!
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Attendance Section */}
      <div className="attendance-section">
        <h3>Today's Attendance</h3>
        {attendance === 'not_marked' ? (
          <div className="attendance-buttons">
            <button 
              className="present-button"
              onClick={() => markAttendance('present')}
            >
              Mark as Present
            </button>
            <button 
              className="absent-button"
              onClick={() => markAttendance('absent')}
            >
              Mark as Absent
            </button>
          </div>
        ) : (
          <p className="attendance-status">
            You are marked as: <span className={attendance}>{attendance}</span>
          </p>
        )}
      </div>

      {/* Wait Request Section */}
      <div className="wait-request-section">
        <h3>Need More Time?</h3>
        {!waitRequestSent ? (
          <>
            {!showWaitForm ? (
              <button 
                className="wait-button"
                onClick={() => setShowWaitForm(true)}
              >
                Request Driver to Wait
              </button>
            ) : (
              <form onSubmit={sendWaitRequest} className="wait-form">
                <div className="form-group">
                  <label htmlFor="waitTime">How many minutes?</label>
                  <input
                    type="number"
                    id="waitTime"
                    min="1"
                    max="15"
                    value={waitMinutes}
                    onChange={(e) => setWaitMinutes(Number(e.target.value))}
                    className="wait-input"
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="send-request-button">
                    Send Request
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowWaitForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <p className="request-sent">
            Wait request sent! Driver will be notified.
          </p>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard