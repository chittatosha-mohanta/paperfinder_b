import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCAYto39xBWIckHX3iGgz5wPDD1l31zVPM",
  authDomain: "paperfinder-pro.firebaseapp.com",
  projectId: "paperfinder-pro",
  storageBucket: "paperfinder-pro.firebasestorage.app",
  messagingSenderId: "643386570943",
  appId: "1:643386570943:web:937956bda83b2f83672e0a"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
