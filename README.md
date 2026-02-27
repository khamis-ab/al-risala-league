# Al-Risala Ramadan Futsal League — Deployment Guide

## What you need
- A free **Firebase** account → firebase.google.com
- A free **Netlify** account → netlify.com
- A free **GitHub** account → github.com (Netlify pulls from here)

---

## STEP 1 — Set up Firebase (5 minutes)

1. Go to **console.firebase.google.com**
2. Click **"Add project"** → name it `al-risala-league` → click through
3. On the left sidebar click **Firestore Database** → **Create database**
   - Choose **"Start in test mode"** → pick any location → Enable
4. On the left sidebar click ⚙️ **Project Settings**
5. Scroll down to **"Your apps"** → click the **</>** (Web) icon
6. Register the app with any nickname → copy the `firebaseConfig` object

7. Open `src/firebase.js` in this project and **paste your config**:

```js
const firebaseConfig = {
  apiKey:            "your-actual-key",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123",
}
```

---

## STEP 2 — Put the code on GitHub (3 minutes)

1. Go to **github.com** → click **"New repository"**
2. Name it `al-risala-league` → Public → Create
3. On your computer, open a terminal in this project folder and run:

```bash
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/al-risala-league.git
git push -u origin main
```

---

## STEP 3 — Deploy on Netlify (3 minutes)

1. Go to **app.netlify.com** → **"Add new site"** → **"Import an existing project"**
2. Connect GitHub → select your `al-risala-league` repo
3. Build settings (Netlify usually auto-detects these):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**
5. Wait ~1 minute → Netlify gives you a URL like `https://al-risala-league.netlify.app`

---

## STEP 4 — Share!

Send that Netlify URL to everyone:
- **Players** just open it — they see standings, matches, squads live
- **Admin** taps 🔐 Admin and enters PIN `1234`

Every score update from the admin syncs to **all devices in real time** via Firebase — no refresh needed.

---

## Changing the Admin PIN

Open `src/App.jsx` and find line:
```js
const ADMIN_PIN = "1234"
```
Change it to whatever you want, then push to GitHub — Netlify auto-redeploys.

---

## Adding Al-Jedyan Sokoor's player names

Once you have their real names:
1. Log in as Admin on the live site
2. Go to **⚙️ Admin → Edit Players**
3. Click each "Player 2", "Player 3" etc. and type the real name → Enter

Changes save to Firebase instantly and everyone sees them.
