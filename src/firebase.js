// ─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR FIREBASE CONFIG HERE
// Go to: Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE",
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// ─── Simple key/value storage API (mirrors window.storage used in the artifact)
const COLLECTION = 'tournament'

export async function storageGet(key) {
  try {
    const snap = await getDoc(doc(db, COLLECTION, key))
    return snap.exists() ? snap.data().value : null
  } catch (e) {
    console.error('storageGet error', e)
    return null
  }
}

export async function storageSet(key, value) {
  try {
    await setDoc(doc(db, COLLECTION, key), { value })
  } catch (e) {
    console.error('storageSet error', e)
  }
}

// Real-time listener — calls callback(value) whenever the doc changes
export function storageSubscribe(key, callback) {
  return onSnapshot(doc(db, COLLECTION, key), snap => {
    callback(snap.exists() ? snap.data().value : null)
  })
}
