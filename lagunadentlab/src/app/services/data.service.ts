/**
 * Servicio de datos para operaciones CRUD en Firestore.
 * Gestiona usuarios, citas y utilidades para el panel de administración.
 */
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Injectable } from '@angular/core';
import { db } from 'src/environments/firebase';
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
  // Elimina una cita de la colección appointments
  async deleteAppointment(citaId: string): Promise<void> {
    const citaRef = doc(db, 'appointments', citaId);
    await deleteDoc(citaRef);
  }
  // Obtiene todas las citas de la colección appointments
  async getAllAppointments(): Promise<any[]> {
    const appointmentsRef = collection(db, 'appointments');
    const querySnapshot = await getDocs(appointmentsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  // Verifica si el usuario tiene el campo isAdmin: true
  async getIsAdmin(uid: string): Promise<boolean> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
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
    const userSnap = await getDoc(userRef);
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


  async getAppointmentsByUser(uid: string): Promise<any[]> {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Actualiza el estado de una cita específica (usando 'status')
  async actualizarEstadoCita(citaId: string, nuevoEstado: string): Promise<void> {
    const citaRef = doc(db, 'appointments', citaId);
    await updateDoc(citaRef, { status: nuevoEstado });
  }
}
