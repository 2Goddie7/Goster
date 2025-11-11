import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Inicializar Auth
export const auth = getAuth(app);

// Exportar la app por si necesitas otros servicios
export default app;