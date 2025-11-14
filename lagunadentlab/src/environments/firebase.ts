import { initializeApp } from "firebase/app";
//Analiticas
import { getAnalytics } from "firebase/analytics";
import { getAuth, indexedDBLocalPersistence, setPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { firebaseConfig } from "./environment";

// Inicializa la app solo una vez
const app = initializeApp(firebaseConfig);

// Exporta las instancias para usarlas en otros archivos
export const auth = getAuth(app);
// Asegurar persistencia offline con IndexedDB (mejor que localStorage)
// Nota: se configura una vez al iniciar la app
setPersistence(auth, indexedDBLocalPersistence).catch(() => {
	// Si falla (navegador raro), Firebase usará la persistencia por defecto
});

// Firestore con caché persistente y soporte multi‑tab
export const db = initializeFirestore(app, {
	localCache: persistentLocalCache({
		tabManager: persistentMultipleTabManager(),
	}),
});

//Analiticas
const analytics = getAnalytics(app);