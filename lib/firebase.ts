import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArb_39bzejeoOhx6ZMRXSVRGhUOlN1sGs",
  authDomain: "conectahub-bfd8c.firebaseapp.com",
  projectId: "conectahub-bfd8c",
  storageBucket: "conectahub-bfd8c.appspot.com",
  messagingSenderId: "714783587280",
  appId: "1:714783587280:web:a92fae765cd8d1960b97d5",
  measurementId: "G-R7SM6734M6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;