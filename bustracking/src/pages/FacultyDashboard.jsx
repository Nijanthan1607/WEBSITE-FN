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

function FacultyDashboard() {
  // State for driver's location
  const [driverLocation, setDriverLocation] = useState({
    lat: 13.0827,
    lng: 80.2707
  })

  // State for announcements
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)

  // State for student attendance
  const [studentAttendance, setStudentAttendance] = useState([
    { id: 1, name: 'Student 1', status: 'present', timestamp: '8:30 AM' },
    { id: 2, name: 'Student 2', status: 'absent', timestamp: '8:45 AM' },
    { id: 3, name: 'Student 3', status: 'present', timestamp: '8:15 AM' },
    { id: 4, name: 'Student 4', status: 'not_marked', timestamp: '-' }
  ])

  // Simulated driver location updates (replace with your backend integration)
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Handle new announcement
  const handleAnnouncement = (e) => {
    e.preventDefault()
    if (newAnnouncement.trim()) {
      const announcement = {
        id: Date.now(),
        text: newAnnouncement,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      }
      setAnnouncements(prev => [announcement, ...prev])
      setNewAnnouncement('')
      setShowAnnouncementForm(false)
      // Here you would typically send this to your backend
      alert('Announcement posted successfully!')
    }
  }

  // Delete announcement
  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    // Here you would typically send this to your backend
  }

  return (
    <div className="dashboard-container faculty-dashboard">
      <h2>Faculty Dashboard</h2>
      
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

      {/* Announcements Section */}
      <div className="announcements-section">
        <h3>Announcements</h3>
        <div className="announcements-header">
          <button 
            className="make-announcement-button"
            onClick={() => setShowAnnouncementForm(true)}
          >
            Make New Announcement
          </button>
        </div>

        {showAnnouncementForm && (
          <form onSubmit={handleAnnouncement} className="announcement-form">
            <textarea
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Type your announcement here..."
              rows="4"
              required
            />
            <div className="form-buttons">
              <button type="submit">Post Announcement</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowAnnouncementForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="announcements-list">
          {announcements.length === 0 ? (
            <p className="no-announcements">No announcements yet</p>
          ) : (
            announcements.map(announcement => (
              <div key={announcement.id} className="announcement-item">
                <div className="announcement-content">
                  <p className="announcement-text">{announcement.text}</p>
                  <div className="announcement-meta">
                    <span>{announcement.date} at {announcement.timestamp}</span>
                    <button 
                      className="delete-button"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attendance Section */}
      <div className="attendance-section">
        <h3>Student Attendance</h3>
        <div className="attendance-list">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendance.map(student => (
                <tr key={student.id} className={`attendance-row ${student.status}`}>
                  <td>{student.name}</td>
                  <td>
                    <span className={`status-badge ${student.status}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td>{student.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard