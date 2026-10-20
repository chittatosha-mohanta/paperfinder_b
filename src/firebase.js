import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAhWPxa2S8fyYbF9ouYVtr4Qroz-EImvH0",
  authDomain: "paperfinder-pro-da24f.firebaseapp.com",
  projectId: "paperfinder-pro-da24f",
  storageBucket: "paperfinder-pro-da24f.firebasestorage.app",
  messagingSenderId: "559735572529",
  appId: "1:559735572529:web:1b0135527f472543c52d10"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
