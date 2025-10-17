import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSCiazwIUKMq7ty9ynHE5WRubblXb_HCQ",
    authDomain: "college-bus-tracking-4a409.firebaseapp.com",
    projectId: "college-bus-tracking-4a409",
    storageBucket: "college-bus-tracking-4a409.firebasestorage.app",
    messagingSenderId: "389847777405",
    appId: "1:389847777405:web:56298ce455dcf3da4ff114"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/invalid-credential') {
      return { user: null, error: 'Invalid email or password. Please try again.' };
    }
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// User management functions
export const createUser = async (userData) => {
  try {
    // Create authentication user
    const authUser = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    // Remove password before storing in Firestore
    const { password, ...userDataWithoutPassword } = userData;
    
    // Add user to Firestore with auth UID
    const docRef = await setDoc(doc(db, 'users', authUser.user.uid), {
      ...userDataWithoutPassword,
      uid: authUser.user.uid,
      notificationEnabled: true,
      createdAt: new Date().toISOString()
    });

    return { id: authUser.user.uid, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { id: null, error: error.message };
  }
};

export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    if (users.length === 0) {
      console.log('No users found with role:', role);
    }
    return { users, error: null };
  } catch (error) {
    console.error('Error getting users by role:', error);
    if (error.code === 'permission-denied') {
      return { users: [], error: 'Database access denied. Please check your Firebase configuration.' };
    }
    return { users: [], error: error.message };
  }
};

// Location tracking functions
export const updateDriverLocation = async (driverId, location) => {
  try {
    const docRef = doc(db, 'drivers', driverId);
    await updateDoc(docRef, {
      location,
      lastUpdated: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const subscribeToDriverLocation = (driverId, callback) => {
  const docRef = doc(db, 'drivers', driverId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ data: doc.data(), error: null });
    } else {
      callback({ data: null, error: 'Driver not found' });
    }
  });
};

// Attendance management
export const markAttendance = async (studentId, date, status) => {
  try {
    const attendanceRef = await addDoc(collection(db, 'attendance'), {
      studentId,
      date,
      status,
      timestamp: new Date().toISOString()
    });
    return { id: attendanceRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getAttendanceByStudent = async (studentId) => {
  try {
    const q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    const attendance = [];
    querySnapshot.forEach((doc) => {
      attendance.push({ id: doc.id, ...doc.data() });
    });
    return { attendance, error: null };
  } catch (error) {
    return { attendance: [], error: error.message };
  }
};

// Announcements
export const createAnnouncement = async (announcement) => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcement,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getAnnouncements = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'announcements'));
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    return { announcements, error: null };
  } catch (error) {
    return { announcements: [], error: error.message };
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    await deleteDoc(doc(db, 'announcements', id));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Bus routes
export const createBusRoute = async (routeData) => {
  try {
    const docRef = await addDoc(collection(db, 'routes'), routeData);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getBusRoutes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'routes'));
    const routes = [];
    querySnapshot.forEach((doc) => {
      routes.push({ id: doc.id, ...doc.data() });
    });
    return { routes, error: null };
  } catch (error) {
    return { routes: [], error: error.message };
  }
};

// Location based notifications
export const updateUserLocation = async (userId, location) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      location,
      lastLocationUpdate: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const subscribeToBusLocation = (busNo, callback) => {
  const q = query(collection(db, 'users'), where('busNo', '==', busNo), where('role', '==', 'driver'));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const driverData = snapshot.docs[0].data();
      callback({ data: driverData, error: null });
    } else {
      callback({ data: null, error: 'Bus not found' });
    }
  });
};

export const sendLocationNotification = async (userId, message) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export { auth, db };