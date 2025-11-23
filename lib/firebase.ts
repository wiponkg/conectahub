
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ IMPORTANTE: Você deve substituir as strings vazias abaixo pelas chaves do seu projeto Firebase.
// 1. Vá para https://console.firebase.google.com/
// 2. Crie um novo projeto
// 3. Adicione um app "Web"
// 4. Copie as configurações do SDK
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI", // Ex: "AIzaSyD..."
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Initialize Firebase
let app;
let auth: any;
let db: any;

try {
  // Check if config is placeholder
  if (firebaseConfig.apiKey === "SUA_API_KEY_AQUI") {
      console.warn("⚠️ Firebase não configurado. Por favor, adicione suas chaves em lib/firebase.ts para funcionalidade completa.");
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
}

export { auth, db };
