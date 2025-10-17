import React, { useEffect, useRef, useState } from 'react'
import { auth } from '../firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function DriverDashboard() {
    const [sharing, setSharing] = useState(false)
    const [status, setStatus] = useState('Not sharing')
    const watchRef = useRef(null)
    const [busId, setBusId] = useState('bus-1') // choose from dropdown or generated
    const nav = useNavigate()

    useEffect(() => {
        // require user to be logged in (simple check)
        // if not, redirect to login
        const unsub = auth.onAuthStateChanged(user => {
            if (!user) nav('/login')
        })
        return () => unsub()
    }, [])

    function startSharing() {
        if (!('geolocation' in navigator)) {
            setStatus('Geolocation not supported')
            return
        }
        setSharing(true)
        setStatus('Requesting permission...')
        watchRef.current = navigator.geolocation.watchPosition(async pos => {
            const payload = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                speed: pos.coords.speed || null,
                ts: Date.now(),
                status: 'running'
            }
            await setDoc(doc(db, 'buses', busId), { ...payload, updatedAt: serverTimestamp() })
            setStatus('Sharing — ' + new Date().toLocaleTimeString())
        }, err => {
            setStatus('Error: ' + err.message)
        }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 })
    }

    function stopSharing() {
        if (watchRef.current) {
            navigator.geolocation.clearWatch(watchRef.current)
            watchRef.current = null
        }
        setSharing(false)
        setStatus('Stopped')
        // set bus status to stopped
        setDoc(doc(db, 'buses', busId), { status: 'stopped', updatedAt: serverTimestamp() }, { merge: true })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <h2 className="text-xl font-semibold">DRIVER — Share Location</h2>
                <div className="mt-3">
                    <label>Choose your bus</label>
                    <select className="w-full p-2 border rounded mt-1" value={busId} onChange={e => setBusId(e.target.value)}>
                        <option value="bus-1">Bus 1</option>
                        <option value="bus-2">Bus 2</option>
                        <option value="bus-3">Bus 3</option>
                    </select>
                </div>

                <div className="mt-4 flex gap-3">
                    <button onClick={startSharing} disabled={sharing} className="btn-primary">Start Sharing</button>
                    <button onClick={stopSharing} disabled={!sharing} className="btn-ghost">Stop</button>
                </div>
                <p className="mt-3 text-sm">Status: {status}</p>
            </div>
            <div className="mt-4 card">
                <h3 className="font-semibold">Controls</h3>
                <p className="text-sm mt-2">Start the trip, send announcements, emergency alert (these can be implemented by writing to `buses/{busId}/announcements` collection).</p>
            </div>
        </div>
    )
}
