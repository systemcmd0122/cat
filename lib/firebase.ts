import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

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

export { auth, db, googleProvider }
