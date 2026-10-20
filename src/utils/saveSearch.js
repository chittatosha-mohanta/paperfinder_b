import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function saveSearch(userId, queryText) {
  if (!userId || !queryText?.trim()) return
  try {
    await addDoc(collection(db, "users", userId, "searchHistory"), {
      query: queryText.trim(),
      createdAt: serverTimestamp()
    })
  } catch (e) {
    console.error("Failed to save search:", e)
  }
}