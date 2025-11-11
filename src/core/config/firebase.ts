import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCsA1gpPy3wkCQWXfiqtdOPrmcUZns_Gqc",
  authDomain: "goster-1b588.firebaseapp.com",
  projectId: "goster-1b588",
  storageBucket: "goster-1b588.firebasestorage.app",
  messagingSenderId: "28848336169",
  appId: "1:28848336169:web:727f995395a9b7f3b15b38",
  measurementId: "G-3TP5701TK6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Inicializar Auth
export const auth = getAuth(app);

// Exportar la app por si necesitas otros servicios
export default app;