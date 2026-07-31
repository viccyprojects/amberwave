/* =========================================================
   FIREBASE CONFIG — fill this in with YOUR project's values
   Firebase console → Project settings → General → Your apps → SDK setup
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyCBJrq4TpfjeapE5uF6OcWwNQjdIeLlse0",
  authDomain: "recordlabel-69e97.firebaseapp.com",
  projectId: "recordlabel-69e97",
  storageBucket: "recordlabel-69e97.firebasestorage.app",
  messagingSenderId: "652434917194",
  appId: "1:652434917194:web:25f3dfa3edc1ff5e53a3b3"
};

let db, auth;
try {
  if (typeof firebase === "undefined") {
    throw new Error("Firebase SDK didn't load (check your internet connection, or an ad/script blocker may be blocking gstatic.com).");
  }
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
} catch (err) {
  // Don't let a failed Firebase init silently break every button on the page —
  // record it so any page (like /admin) can show a real message instead of
  // just doing nothing when someone clicks something.
  window.__awFirebaseInitError = err;
  console.error("Firebase init failed:", err);
}
