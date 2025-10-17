import React from 'react'

export default function AdminDashboard() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <h2 className="text-xl font-semibold">ADMIN DASHBOARD</h2>
                <p className="mt-2">Use the Firebase Console (Authentication) to create driver/student/faculty accounts, or run the Admin script locally (instructions below).</p>

                <div className="mt-4">
                    <h3 className="font-semibold">Reports</h3>
                    <ul className="mt-2 list-disc pl-5">
                        <li>Bus Attendance</li>
                        <li>Bus Arriving Accuracy</li>
                        <li>Bus Reports</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
