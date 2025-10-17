import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  createUser,
  db,
  subscribeToBusLocation, 
  sendLocationNotification,
  updateUserLocation,
  createBusRoute,
  getBusRoutes
} from '../firebase';

function AdminDashboard() {
  // State for buses
  const [buses, setBuses] = useState([
    { id: 1, number: 'BUS001', route: 'Route A', driver: 'John Doe', capacity: 40 }
  ])
  const [showBusForm, setShowBusForm] = useState(false)
  const [newBus, setNewBus] = useState({ number: '', route: '', driver: '', capacity: 40 })
  
  // State for location tracking and notifications
  const [busLocations, setBusLocations] = useState({})
  const [notifications, setNotifications] = useState([])

  // State for students
  const [students, setStudents] = useState([
    { id: 1, name: 'Student 1', route: 'Route A', stop: 'Stop 1', contact: '1234567890' }
  ])
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: '', route: '', stop: '', contact: '' })

  // State for faculty
  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Faculty 1', department: 'CSE', route: 'Route A', contact: '0987654321' }
  ])
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [newFaculty, setNewFaculty] = useState({ name: '', department: '', route: '', contact: '' })

  // State for routes
  const [routes, setRoutes] = useState(['Route A', 'Route B', 'Route C'])
  const [showRouteForm, setShowRouteForm] = useState(false)
  const [newRoute, setNewRoute] = useState('')

  // State for user credentials
  const [credentials, setCredentials] = useState([
    { id: 1, userId: 'student1', password: 'pass123', type: 'student', name: 'Student 1' },
    { id: 2, userId: 'faculty1', password: 'pass123', type: 'faculty', name: 'Faculty 1' },
    { id: 3, userId: 'driver1', password: 'pass123', type: 'driver', name: 'Driver 1' }
  ])
  const [showCredentialForm, setShowCredentialForm] = useState(false)
  const [newCredential, setNewCredential] = useState({ userId: '', password: '', type: '', name: '' })

  // Handle bus operations
  const handleAddBus = (e) => {
    e.preventDefault()
    const bus = {
      id: Date.now(),
      ...newBus
    }
    setBuses(prev => [...prev, bus])
    setNewBus({ number: '', route: '', driver: '', capacity: 40 })
    setShowBusForm(false)
    alert('Bus added successfully!')
  }

  const deleteBus = (id) => {
    setBuses(prev => prev.filter(bus => bus.id !== id))
  }

  // Handle student operations
  const handleAddStudent = (e) => {
    e.preventDefault()
    const student = {
      id: Date.now(),
      ...newStudent
    }
    setStudents(prev => [...prev, student])
    setNewStudent({ name: '', route: '', stop: '', contact: '' })
    setShowStudentForm(false)
    // Update route capacity
    updateRouteCapacity(student.route)
    alert('Student added successfully!')
  }

  const deleteStudent = (id) => {
    const student = students.find(s => s.id === id)
    setStudents(prev => prev.filter(s => s.id !== id))
    // Update route capacity
    if (student) updateRouteCapacity(student.route)
  }

  // Handle faculty operations
  const handleAddFaculty = (e) => {
    e.preventDefault()
    const facultyMember = {
      id: Date.now(),
      ...newFaculty
    }
    setFaculty(prev => [...prev, facultyMember])
    setNewFaculty({ name: '', department: '', route: '', contact: '' })
    setShowFacultyForm(false)
    // Update route capacity
    updateRouteCapacity(facultyMember.route)
    alert('Faculty added successfully!')
  }

  const deleteFaculty = (id) => {
    const facultyMember = faculty.find(f => f.id === id)
    setFaculty(prev => prev.filter(f => f.id !== id))
    // Update route capacity
    if (facultyMember) updateRouteCapacity(facultyMember.route)
  }

  // Handle route operations
  const handleAddRoute = (e) => {
    e.preventDefault()
    if (!routes.includes(newRoute)) {
      setRoutes(prev => [...prev, newRoute])
      setNewRoute('')
      setShowRouteForm(false)
      alert('Route added successfully!')
    } else {
      alert('This route already exists!')
    }
  }

  const updateRouteCapacity = (route) => {
    // Count total passengers for the route
    const studentsOnRoute = students.filter(s => s.route === route).length
    const facultyOnRoute = faculty.filter(f => f.route === route).length
    const totalPassengers = studentsOnRoute + facultyOnRoute
    
    // Update bus capacity warning if needed
    const busOnRoute = buses.find(b => b.route === route)
    if (busOnRoute && totalPassengers > busOnRoute.capacity) {
      alert(`Warning: Route ${route} has exceeded bus capacity!`)
    }
  }

  // Set up location tracking for buses
  useEffect(() => {
    const unsubscribers = buses.map(bus => {
      return subscribeToBusLocation(bus.number, ({ data, error }) => {
        if (!error && data) {
          setBusLocations(prev => ({
            ...prev,
            [bus.number]: data.location
          }));

          // Check if bus is near stops and send notifications
          if (data.location) {
            checkAndSendNotifications(bus.number, data.location);
          }
        }
      });
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [buses]);

  const checkAndSendNotifications = async (busNo, location) => {
    const bus = buses.find(b => b.number === busNo);
    if (!bus) return;

    // Get all stops on this route
    const studentsOnRoute = students.filter(s => s.route === bus.route);
    const stops = [...new Set(studentsOnRoute.map(s => s.stop))];

    stops.forEach(async stop => {
      // In a real app, you'd use proper distance calculation
      const isNearStop = true; // Replace with actual distance check
      if (isNearStop) {
        const message = `Bus ${busNo} is approaching ${stop}`;
        const { error } = await sendLocationNotification('all', message);
        if (!error) {
          setNotifications(prev => [...prev, { 
            message, 
            timestamp: new Date(),
            busNo,
            stop 
          }]);
        }
      }
    });
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Location Tracking and Notifications */}
      <div className="management-section">
        <div className="section-header">
          <h3>Live Bus Locations & Notifications</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-3">Live Bus Locations</h4>
            <div className="space-y-3">
              {Object.entries(busLocations).map(([busNo, location]) => (
                <div key={busNo} className="border p-3 rounded">
                  <h5 className="font-medium">Bus {busNo}</h5>
                  <p className="text-sm text-gray-600">
                    Lat: {location?.lat}, Long: {location?.lng}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-3">Recent Notifications</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.map((notif, index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bus Management Section */}
      <div className="management-section">
        <div className="section-header">
          <h3>Bus Management</h3>
          <button onClick={() => setShowBusForm(true)}>Add New Bus</button>
        </div>

        {showBusForm && (
          <form onSubmit={handleAddBus} className="admin-form">
            <input
              type="text"
              placeholder="Bus Number"
              value={newBus.number}
              onChange={e => setNewBus({...newBus, number: e.target.value})}
              required
            />
            <select
              value={newBus.route}
              onChange={e => setNewBus({...newBus, route: e.target.value})}
              required
            >
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Driver Name"
              value={newBus.driver}
              onChange={e => setNewBus({...newBus, driver: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Capacity"
              value={newBus.capacity}
              onChange={e => setNewBus({...newBus, capacity: parseInt(e.target.value)})}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add Bus</button>
              <button type="button" onClick={() => setShowBusForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Driver</th>
                <th>Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {buses.map(bus => (
                <tr key={bus.id}>
                  <td>{bus.number}</td>
                  <td>{bus.route}</td>
                  <td>{bus.driver}</td>
                  <td>{bus.capacity}</td>
                  <td>
                    <button onClick={() => deleteBus(bus.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Management Section */}
      <div className="management-section">
        <div className="section-header">
          <h3>Student Management</h3>
          <button onClick={() => setShowStudentForm(true)}>Add New Student</button>
        </div>

        {showStudentForm && (
          <form onSubmit={handleAddStudent} className="admin-form">
            <input
              type="text"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={e => setNewStudent({...newStudent, name: e.target.value})}
              required
            />
            <select
              value={newStudent.route}
              onChange={e => setNewStudent({...newStudent, route: e.target.value})}
              required
            >
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Bus Stop"
              value={newStudent.stop}
              onChange={e => setNewStudent({...newStudent, stop: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Contact Number"
              value={newStudent.contact}
              onChange={e => setNewStudent({...newStudent, contact: e.target.value})}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add Student</button>
              <button type="button" onClick={() => setShowStudentForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Route</th>
                <th>Stop</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.route}</td>
                  <td>{student.stop}</td>
                  <td>{student.contact}</td>
                  <td>
                    <button onClick={() => deleteStudent(student.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Management Section */}
      <div className="management-section">
        <div className="section-header">
          <h3>Faculty Management</h3>
          <button onClick={() => setShowFacultyForm(true)}>Add New Faculty</button>
        </div>

        {showFacultyForm && (
          <form onSubmit={handleAddFaculty} className="admin-form">
            <input
              type="text"
              placeholder="Faculty Name"
              value={newFaculty.name}
              onChange={e => setNewFaculty({...newFaculty, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Department"
              value={newFaculty.department}
              onChange={e => setNewFaculty({...newFaculty, department: e.target.value})}
              required
            />
            <select
              value={newFaculty.route}
              onChange={e => setNewFaculty({...newFaculty, route: e.target.value})}
              required
            >
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Contact Number"
              value={newFaculty.contact}
              onChange={e => setNewFaculty({...newFaculty, contact: e.target.value})}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add Faculty</button>
              <button type="button" onClick={() => setShowFacultyForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Route</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map(f => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.department}</td>
                  <td>{f.route}</td>
                  <td>{f.contact}</td>
                  <td>
                    <button onClick={() => deleteFaculty(f.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Management Section */}
      <div className="management-section">
        <div className="section-header">
          <h3>Route Management</h3>
          <button onClick={() => setShowRouteForm(true)}>Add New Route</button>
        </div>

        {showRouteForm && (
          <form onSubmit={handleAddRoute} className="admin-form">
            <input
              type="text"
              placeholder="Route Name"
              value={newRoute}
              onChange={e => setNewRoute(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add Route</button>
              <button type="button" onClick={() => setShowRouteForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="routes-list">
          {routes.map(route => (
            <div key={route} className="route-item">
              <span>{route}</span>
              <div className="route-stats">
                <span>Students: {students.filter(s => s.route === route).length}</span>
                <span>Faculty: {faculty.filter(f => f.route === route).length}</span>
                <span>Bus: {buses.find(b => b.route === route)?.number || 'Not assigned'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Credentials Management Section */}
      <div className="management-section">
        <div className="section-header">
          <h3>User Credentials Management</h3>
          <button onClick={() => setShowCredentialForm(true)}>Add New User Credentials</button>
        </div>

        {showCredentialForm && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const cred = {
              id: Date.now(),
              ...newCredential
            };
            setCredentials(prev => [...prev, cred]);
            setNewCredential({ userId: '', password: '', type: '', name: '' });
            setShowCredentialForm(false);
            alert('User credentials added successfully!');
          }} className="admin-form">
            <input
              type="text"
              placeholder="User ID"
              value={newCredential.userId}
              onChange={e => setNewCredential({...newCredential, userId: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newCredential.password}
              onChange={e => setNewCredential({...newCredential, password: e.target.value})}
              required
            />
            <select
              value={newCredential.type}
              onChange={e => setNewCredential({...newCredential, type: e.target.value})}
              required
            >
              <option value="">Select User Type</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="driver">Driver</option>
            </select>
            <input
              type="text"
              placeholder="User Name"
              value={newCredential.name}
              onChange={e => setNewCredential({...newCredential, name: e.target.value})}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add User</button>
              <button type="button" onClick={() => setShowCredentialForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map(cred => (
                <tr key={cred.id}>
                  <td>{cred.userId}</td>
                  <td>{cred.name}</td>
                  <td><span className={`user-type ${cred.type}`}>{cred.type}</span></td>
                  <td>
                    <span className="password-mask">••••••••</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => {
                        setCredentials(prev => prev.filter(c => c.id !== cred.id));
                        alert('User credentials deleted successfully!');
                      }} 
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard