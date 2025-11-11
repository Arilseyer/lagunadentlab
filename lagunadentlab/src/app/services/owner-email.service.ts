import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class OwnerEmailService {
  private initialized = false;

  private get cfg() {
    return environment.emailJsConfig;
  }

  private ensureInit() {
    if (!this.initialized && this.cfg?.publicKey && this.cfg.publicKey !== 'OwFETnPu6p8W-xQBI') {
      emailjs.init(this.cfg.publicKey);
      this.initialized = true;
    }
  }

  async sendAppointmentNotification(appointment: any) {
    try {
      this.ensureInit();
      if (!this.cfg || !this.cfg.serviceId || !this.cfg.templates || this.cfg.publicKey === 'OwFETnPu6p8W-xQBI') {
        console.warn('[OwnerEmailService] Falta configurar EmailJS (publicKey/serviceId/templateId).');
        return;
      }

      // Mapea los parámetros esperados por tu template en EmailJS
      const templateParams: Record<string, any> = {
        subject: 'Nueva solicitud de servicio',
        user_name: appointment?.name ?? '',
        user_email: appointment?.email ?? '',
        user_phone: appointment?.phone ?? '',
        service_type: appointment?.serviceType ?? '',
        preferred_date: appointment?.date ?? '',
        preferred_time: appointment?.time ?? '',
        notes: appointment?.notes ?? '',
        status: appointment?.status ?? 'Pendiente',
        created_at: (appointment?.createdAt instanceof Date)
          ? appointment.createdAt.toISOString()
          : new Date().toISOString(),
      };

      await emailjs.send(this.cfg.serviceId, this.cfg.templates.requestService, templateParams);
      console.info('[OwnerEmailService] EmailJS enviado correctamente.');
    } catch (err) {
      console.error('[OwnerEmailService] Error enviando EmailJS:', err);
    }
  }
}
