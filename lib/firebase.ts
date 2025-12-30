import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCnzbv3zoYVc4opA2ELEuwRRO3EwvuWuZ8",
  authDomain: "love-cat-9352a.firebaseapp.com",
  projectId: "love-cat-9352a",
  storageBucket: "love-cat-9352a.firebasestorage.app",
  messagingSenderId: "311491167108",
  appId: "1:311491167108:web:5cebe2c9d24326ad04d3d1",
  measurementId: "G-PDFBPV2ZHG",
}

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Function to get user by ID
const getUserById = async (userId: string) => {
  const userDocRef = doc(db, "users", userId)
  const userDoc = await getDoc(userDocRef)
  return userDoc.exists() ? userDoc.data() : null
}

// Function to get user by email
const getUserByEmail = async (email: string) => {
  const usersRef = collection(db, "users")
  const q = query(usersRef, where("email", "==", email))
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }
  return querySnapshot.docs[0].data()
}

export { auth, db, googleProvider, getUserById, getUserByEmail }
