import React, { useState } from 'react';
import { initializeFirestore, testCredentials } from '../utils/initFirestore';

function DatabaseInit() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      setSuccess(false);
      
      console.log('Starting database initialization...');
      const result = await initializeFirestore();
      
      if (result) {
        console.log('Database initialization successful');
        setSuccess(true);
      } else {
        throw new Error('Database initialization failed');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      setError(error.message || 'Failed to initialize database. Check console for details.');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="database-init-container">
      <h2>Initialize Database</h2>
      <p>This will create test users and sample data in your Firebase database.</p>
      
      <div className="test-credentials">
        <h3>Test Credentials</h3>
        {testCredentials.map(({ email, password, role }) => (
          <div key={email} className="credential-item">
            <strong>{role.toUpperCase()}</strong>
            <p>Email: {email}</p>
            <p>Password: {password}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={handleInitialize} 
        disabled={isInitializing}
        className="init-button"
      >
        {isInitializing ? 'Initializing...' : 'Initialize Database'}
      </button>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Database initialized successfully! You can now log in with the test credentials above.
        </div>
      )}

      <style jsx>{`
        .database-init-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          border: 2px solid var(--color-yellow);
          border-radius: 12px;
          background-color: white;
        }

        .test-credentials {
          margin: 2rem 0;
          padding: 1rem;
          background-color: #f8f8f8;
          border-radius: 8px;
        }

        .credential-item {
          margin: 1rem 0;
          padding: 1rem;
          border: 1px solid var(--color-yellow);
          border-radius: 6px;
          background-color: white;
        }

        .credential-item strong {
          color: var(--color-black);
          display: block;
          margin-bottom: 0.5rem;
        }

        .credential-item p {
          margin: 0.25rem 0;
          color: var(--color-gray);
        }

        .init-button {
          width: 100%;
          margin-top: 1rem;
        }

        .error-message {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 6px;
        }

        .success-message {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #e8f5e9;
          color: #2e7d32;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}

export default DatabaseInit;