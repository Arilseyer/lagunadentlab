/**
 * Servicio de datos para operaciones CRUD en Firestore.
 * Gestiona usuarios, citas y utilidades para el panel de administración.
 */
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocFromCache, getDocsFromCache } from 'firebase/firestore';
import { Injectable } from '@angular/core';
import { db } from 'src/environments/firebase';
import { OnlineService } from './online.service';
// Constante para los estados de cita
export const CITA_ESTADOS = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  COMPLETADA: 'Completada'
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private online: OnlineService) {}
  // Elimina una cita de la colección appointments
  async deleteAppointment(citaId: string): Promise<void> {
    const citaRef = doc(db, 'appointments', citaId);
    await deleteDoc(citaRef);
  }
  // Obtiene todas las citas de la colección appointments
  async getAllAppointments(): Promise<any[]> {
    const appointmentsRef = collection(db, 'appointments');
    // Si no hay conexión, intenta usar caché
    if (!this.online.isOnline) {
      try {
        const cachedSnap = await getDocsFromCache(appointmentsRef);
        return cachedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch {
        return [];
      }
    }
    const querySnapshot = await getDocs(appointmentsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  // Verifica si el usuario tiene el campo isAdmin: true
  async getIsAdmin(uid: string): Promise<boolean> {
    const userRef = doc(db, 'users', uid);
    let userSnap;
    // Si no hay conexión, intenta servir de caché
    if (!this.online.isOnline) {
      try {
        userSnap = await getDocFromCache(userRef);
      } catch {
        // si no hay caché, y no hay conexión, no se puede consultar al servidor
        return false;
      }
    } else {
      userSnap = await getDoc(userRef);
    }
    if (userSnap.exists()) {
      const data = userSnap.data();
  return !!data['isAdmin'];
    }
    return false;
  }
  async saveUserProfile(uid: string, profile: any): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, profile, { merge: true });
  }

  async getUserProfile(uid: string): Promise<any> {
    const userRef = doc(db, 'users', uid);
    // Intentar devolver instantáneamente desde caché si estamos offline
    let userSnap;
    if (!this.online.isOnline) {
      try {
        userSnap = await getDocFromCache(userRef);
      } catch {
        return null;
      }
    } else {
      userSnap = await getDoc(userRef);
    }
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  }

  async saveAppointment(appointment: any): Promise<void> {
    const appointmentsRef = collection(db, 'appointments');
    await addDoc(appointmentsRef, appointment);
  }

  // Guarda un mensaje de contacto (se encola offline si no hay conexión)
  async saveContactMessage(message: any): Promise<void> {
    const messagesRef = collection(db, 'contact_messages');
    await addDoc(messagesRef, message);
  }


  async getAppointmentsByUser(uid: string): Promise<any[]> {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('uid', '==', uid));
    // Si no hay conexión, intenta usar caché inmediatamente
    if (!this.online.isOnline) {
      try {
        const cachedSnap = await getDocsFromCache(q);
        return cachedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch {
        return [];
      }
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Actualiza el estado de una cita específica (usando 'status')
  async actualizarEstadoCita(citaId: string, nuevoEstado: string): Promise<void> {
    const citaRef = doc(db, 'appointments', citaId);
    await updateDoc(citaRef, { status: nuevoEstado });
  }
}
