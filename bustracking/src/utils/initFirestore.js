import { 
  getAuth, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc,
  setDoc,
  doc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Test users data
const testUsers = [
  {
    email: 'admin@bus.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    phone: '1234567890'
  },
  {
    email: 'student1@bus.com',
    password: 'student123',
    role: 'student',
    name: 'John Student',
    studentId: 'STU001',
    class: '10-A',
    phone: '1234567891'
  },
  {
    email: 'faculty1@bus.com',
    password: 'faculty123',
    role: 'faculty',
    name: 'Jane Faculty',
    facultyId: 'FAC001',
    department: 'Mathematics',
    phone: '1234567892'
  },
  {
    email: 'driver1@bus.com',
    password: 'driver123',
    role: 'driver',
    name: 'Mike Driver',
    driverId: 'DRV001',
    licenseNumber: 'LIC123456',
    phone: '1234567893'
  }
];

// Sample bus routes
const sampleRoutes = [
  {
    routeId: 'RT001',
    name: 'Morning Route 1',
    driverId: 'DRV001',
    stops: [
      { name: 'Stop 1', time: '7:30 AM', location: { lat: 12.9716, lng: 77.5946 } },
      { name: 'Stop 2', time: '7:45 AM', location: { lat: 12.9815, lng: 77.5921 } },
      { name: 'Stop 3', time: '8:00 AM', location: { lat: 12.9766, lng: 77.5993 } }
    ],
    schedule: 'Morning',
    status: 'active'
  }
];

// Sample announcements
const sampleAnnouncements = [
  {
    title: 'Bus Schedule Change',
    content: 'Morning route will be delayed by 15 minutes tomorrow due to road work.',
    createdBy: 'admin@bus.com',
    timestamp: new Date().toISOString(),
    type: 'schedule_change'
  }
];

// Function to create a user in both Authentication and Firestore
const createUserWithRole = async (userData) => {
  try {
    let userCredential;
    try {
      console.log(`Attempting to create user: ${userData.email}`);
      // Try to create new user
      userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      console.log(`Successfully created auth user: ${userData.email}`);
    } catch (authError) {
      console.log(`Auth error for ${userData.email}:`, authError.code);
      // If user already exists, try to create/update Firestore document only
      if (authError.code === 'auth/email-already-in-use') {
        console.log(`User ${userData.email} already exists in Auth, checking Firestore...`);
        // Query users collection to find the document with matching email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', userData.email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log(`No Firestore document found for ${userData.email}, creating one...`);
          // Create new document with generated ID
          await addDoc(collection(db, 'users'), {
            ...userData,
            createdAt: new Date().toISOString(),
            status: 'active'
          });
          console.log(`Created Firestore document for existing user: ${userData.email}`);
        } else {
          console.log(`Firestore document already exists for ${userData.email}`);
        }
        return true;
      }
      throw authError;
    }

    // Remove password before storing in Firestore
    const { password, ...userDataWithoutPassword } = userData;

    console.log(`Creating Firestore document for: ${userData.email}`);
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userDataWithoutPassword,
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    console.log(`Successfully created user and Firestore document: ${userData.email}`);
    return true;
  } catch (error) {
    console.error(`Error in createUserWithRole for ${userData.email}:`, error);
    throw error;
  }
};

// Function to initialize route data
const initializeRoutes = async () => {
  try {
    for (const route of sampleRoutes) {
      await addDoc(collection(db, 'routes'), {
        ...route,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    console.log('Sample routes created successfully');
    return true;
  } catch (error) {
    console.error('Error creating routes:', error.message);
    return false;
  }
};

// Function to initialize announcements
const initializeAnnouncements = async () => {
  try {
    for (const announcement of sampleAnnouncements) {
      await addDoc(collection(db, 'announcements'), announcement);
    }
    console.log('Sample announcements created successfully');
    return true;
  } catch (error) {
    console.error('Error creating announcements:', error.message);
    return false;
  }
};

// Main initialization function
export const initializeFirestore = async () => {
  console.log('Starting Firestore initialization...');

  try {
    // Create test users
    console.log('Creating test users...');
    for (const user of testUsers) {
      try {
        await createUserWithRole(user);
      } catch (error) {
        console.error(`Failed to create user ${user.email}:`, error);
        throw error;
      }
    }

    // Verify users were created
    console.log('Verifying user creation...');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    console.log(`Found ${snapshot.size} users in database`);
    
    snapshot.forEach(doc => {
      console.log('User in database:', doc.data().email, 'Role:', doc.data().role);
    });

    // Initialize other collections
    console.log('Initializing routes...');
    await initializeRoutes();
    
    console.log('Initializing announcements...');
    await initializeAnnouncements();

    console.log('Firestore initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Export test user credentials for reference
export const testCredentials = testUsers.map(({ email, password, role }) => ({
  email,
  password,
  role
}));