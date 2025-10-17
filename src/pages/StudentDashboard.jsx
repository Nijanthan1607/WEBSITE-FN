import React, { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function StudentDashboard() {
    const [busId, setBusId] = useState('bus-1')
    const [pos, setPos] = useState(null)
    const nav = useNavigate()

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(user => {
            if (!user) nav('/login')
        })
        return () => unsubAuth()
    }, [])

    useEffect(() => {
        const ref = doc(db, 'buses', busId)
        const unsub = onSnapshot(ref, snap => {
            if (snap.exists()) {
                const d = snap.data()
                if (d.lat && d.lon) setPos({ lat: d.lat, lon: d.lon, ts: d.ts })
                else setPos(null)
            } else {
                setPos(null)
            }
        })
        return () => unsub()
    }, [busId])

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card">
                <h2 className="text-xl font-semibold">STUDENT — Live Bus View</h2>
                <div className="mt-3">
                    <label>Choose your bus</label>
                    <select className="w-full p-2 border rounded mt-1" value={busId} onChange={e => setBusId(e.target.value)}>
                        <option value="bus-1">Bus 1</option>
                        <option value="bus-2">Bus 2</option>
                        <option value="bus-3">Bus 3</option>
                    </select>
                </div>

                <div className="mt-4">
                    {pos ? (
                        <div className="map-container rounded overflow-hidden shadow">
                            <MapContainer center={[pos.lat, pos.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                                <Marker position={[pos.lat, pos.lon]}>
                                    <Popup>Bus: {busId}<br />Updated: {new Date(pos.ts || Date.now()).toLocaleTimeString()}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <p>No active bus sharing right now. Ask the driver to start sharing.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
