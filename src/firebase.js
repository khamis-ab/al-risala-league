// ─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR FIREBASE CONFIG HERE
// Go to: Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyBnwAHJxcv18kUzRVDccyrioKUgEpoWmLQ",
  authDomain:        "al-risala.firebaseapp.com",
  projectId:         "al-risala",
  storageBucket:     "al-risala.firebasestorage.app",
  messagingSenderId: "349626102986",
  appId:             "1:349626102986:web:eb73aa21e42c080816f033",
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
