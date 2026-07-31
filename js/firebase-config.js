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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
