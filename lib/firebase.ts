import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration provided from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyArb_39bzejeoOhx6ZMRXSVRGhUOlN1sGs",
  authDomain: "conectahub-bfd8c.firebaseapp.com",
  projectId: "conectahub-bfd8c",
  storageBucket: "conectahub-bfd8c.firebasestorage.app",
  messagingSenderId: "714783587280",
  appId: "1:714783587280:web:a92fae765cd8d1960b97d5",
  measurementId: "G-R7SM6734M6"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
}

export { auth, db };