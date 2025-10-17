import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('driver')
    const nav = useNavigate()

    async function handleLogin(e) {
        e.preventDefault()
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password)
            // route based on selected role
            if (role === 'driver') nav('/driver')
            if (role === 'student') nav('/student')
            if (role === 'faculty') nav('/faculty')
            if (role === 'admin') nav('/admin')
        } catch (err) {
            alert('Login error: ' + err.message)
        }
    }

    return (
        <div className="max-w-xl mx-auto card">
            <h2 className="text-xl font-semibold">USER LOGIN</h2>

            <div className="mt-3">
                <label className="block">Choose role</label>
                <select className="w-full p-2 border rounded mt-1" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="driver">Driver</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>

            <form onSubmit={handleLogin} className="mt-4 space-y-3">
                <div>
                    <label className="block">Enter User ID (email)</label>
                    <input className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="block">Enter Password</label>
                    <input type="password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="flex gap-3">
                    <button className="btn-primary" type="submit">LOGIN</button>
                </div>
            </form>
        </div>
    )
}
