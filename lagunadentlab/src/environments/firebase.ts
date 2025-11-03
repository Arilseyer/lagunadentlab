import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./environment";

// Inicializa la app solo una vez
const app = initializeApp(firebaseConfig);

// Exporta las instancias para usarlas en otros archivos
export const auth = getAuth(app);
export const db = getFirestore(app);