import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';

/**
 * OwnerEmailService
 * Envía notificaciones por correo al dueño usando EmailJS.
 * No reemplaza ningún flujo existente; es complementario.
 */
@Injectable({ providedIn: 'root' })
export class OwnerEmailService {
  private inited = false;

  private ensureInit() {
    if (!this.inited && environment.emailjs?.publicKey) {
      try {
        emailjs.init(environment.emailjs.publicKey);
        this.inited = true;
      } catch (e) {
        console.warn('EmailJS init warning:', e);
      }
    }
  }

  async sendOwnerContact(form: { name: string; email: string; phone: string; message: string; createdAt?: any; }): Promise<void> {
    this.ensureInit();

    const serviceId = environment.emailjs?.serviceId;
    const templateId = environment.emailjs?.templates?.contactOwner;
    const publicKey = environment.emailjs?.publicKey;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS config faltante. Completa environment.emailjs');
      return; // no bloquear flujo
    }

    const templateParams = {
      // Ajusta estos nombres a tu template en EmailJS
      to_name: 'Owner',
      from_name: form.name,
      from_email: form.email,
      phone: form.phone,
      message: form.message,
      created_at: (form.createdAt || new Date()).toString()
    } as any;

    await emailjs.send(serviceId, templateId, templateParams, { publicKey });
  }

  async sendOwnerAppointment(form: { name: string; email: string; phone: string; serviceType: string; date: string; time: string; notes?: string; uid?: string; createdAt?: any; }): Promise<void> {
    this.ensureInit();

    const serviceId = environment.emailjs?.serviceId;
    const templateId = environment.emailjs?.templates?.appointmentOwner;
    const publicKey = environment.emailjs?.publicKey;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS config faltante. Completa environment.emailjs');
      return;
    }

    const templateParams = {
      to_name: 'Owner',
      user_name: form.name,
      user_email: form.email,
      user_phone: form.phone,
      service_type: form.serviceType,
      date: form.date,
      time: form.time,
      notes: form.notes || '',
      uid: form.uid || '',
      created_at: (form.createdAt || new Date()).toString()
    } as any;

    await emailjs.send(serviceId, templateId, templateParams, { publicKey });
  }
}
