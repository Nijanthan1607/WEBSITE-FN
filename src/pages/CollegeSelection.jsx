import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CollegeSelection() {
    const nav = useNavigate()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
                <h2 className="text-2xl font-semibold">SELECT YOUR COLLEGE</h2>
                <div className="mt-4 space-y-2">
                    <button onClick={() => nav('/login')} className="btn-primary">EXAMPLE INSTITUTE OF ENGINEERING</button>
                </div>
                <div className="mt-6">
                    <p className="text-sm text-gray-600">Other options: Add Your College (Admin)</p>
                </div>
            </div>

            <div className="card">
                <h3 className="font-semibold">USER TYPES</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="btn-ghost" onClick={() => nav('/login')}>DRIVER</button>
                    <button className="btn-ghost" onClick={() => nav('/login')}>FACULTY</button>
                    <button className="btn-ghost" onClick={() => nav('/login')}>STUDENT</button>
                    <button className="btn-ghost" onClick={() => nav('/admin')}>ADMINISTRATOR</button>
                </div>
            </div>
        </div>
    )
}
