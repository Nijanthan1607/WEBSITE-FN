import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import CollegeSelection from './pages/collegeselection.jsx'
import Login from './pages/login.jsx'
import DriverDashboard from './pages/driverdashboard.jsx'
import StudentDashboard from './pages/studentdashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import FacultyDashboard from './pages/facultydashboard.jsx'

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-yellow-400 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold">TrackMyBus</h1>
                    <nav className="space-x-3">
                        <Link to="/" className="text-sm">Home</Link>
                        <Link to="/login" className="text-sm">Login</Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto p-6">
                <Routes>
                    <Route path="/" element={<CollegeSelection />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/driver" element={<DriverDashboard />} />
                    <Route path="/student" element={<StudentDashboard />} />
                    <Route path="/faculty" element={<FacultyDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </main>

            <footer className="text-center p-4 text-sm text-gray-600">© {new Date().getFullYear()} TrackMyBus</footer>
        </div>
    )
}
