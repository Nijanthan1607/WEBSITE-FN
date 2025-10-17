import React, { useState, useEffect } from 'react'

function DriverDashboard() {
  const [isSharing, setIsSharing] = useState(false)
  const [location, setLocation] = useState(null)
  const [timer, setTimer] = useState(0)
  const [duration, setDuration] = useState(60) // default 60 minutes
  const [startTime, setStartTime] = useState(null)

  // Handle location sharing
  const startSharingLocation = () => {
    if ("geolocation" in navigator) {
      setIsSharing(true)
      setStartTime(Date.now())
      
      // Start watching position
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Here you would typically send this to your backend
          console.log("Location updated:", position.coords)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Error getting location. Please check your GPS settings.")
          setIsSharing(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const stopSharingLocation = () => {
    setIsSharing(false)
    setStartTime(null)
    setLocation(null)
  }

  // Update timer every minute
  useEffect(() => {
    let interval
    if (isSharing && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 60000) // convert to minutes
        setTimer(elapsed)
        
        // Stop sharing when duration is reached
        if (elapsed >= duration) {
          stopSharingLocation()
          alert("Location sharing duration completed")
        }
      }, 60000) // update every minute
    }
    return () => clearInterval(interval)
  }, [isSharing, startTime, duration])

  return (
    <div className="dashboard-container">
      <h2>Driver Dashboard</h2>
      
      <div className="location-controls">
        <h3>Location Sharing Settings</h3>
        
        {!isSharing ? (
          <div className="sharing-setup">
            <div className="duration-selector">
              <label htmlFor="duration">Share Location For (minutes):</label>
              <select 
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="duration-select"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
            <button onClick={startSharingLocation} className="share-button">
              Start Sharing Location
            </button>
          </div>
        ) : (
          <div className="sharing-active">
            <div className="status-info">
              <p>Location sharing is active</p>
              <p>Time elapsed: {timer} minutes</p>
              <p>Time remaining: {duration - timer} minutes</p>
              {location && (
                <p className="coordinates">
                  Current position:<br />
                  Latitude: {location.lat.toFixed(6)}<br />
                  Longitude: {location.lng.toFixed(6)}
                </p>
              )}
            </div>
            <button onClick={stopSharingLocation} className="stop-button">
              Stop Sharing Location
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverDashboard