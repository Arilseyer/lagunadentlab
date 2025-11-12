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
    if (!this.initialized && this.cfg?.publicKey) {
      console.log('[OwnerEmailService] Inicializando EmailJS con publicKey:', this.cfg.publicKey.substring(0, 10) + '...');
      emailjs.init(this.cfg.publicKey);
      this.initialized = true;
    } else if (!this.cfg?.publicKey) {
      console.warn('[OwnerEmailService] No se puede inicializar: publicKey está vacío');
    }
  }

  async sendAppointmentNotification(appointment: any) {
    try {
      console.log('[OwnerEmailService] Iniciando envío de notificación de cita...');
      console.log('[OwnerEmailService] Datos recibidos:', appointment);
      this.ensureInit();
      
      if (!this.isConfigured()) {
        console.warn('[OwnerEmailService] EmailJS no está configurado correctamente.');
        console.warn('[OwnerEmailService] Config actual:', {
          hasPublicKey: !!this.cfg?.publicKey,
          publicKey: this.cfg?.publicKey,
          hasServiceId: !!this.cfg?.serviceId,
          serviceId: this.cfg?.serviceId,
          hasTemplates: !!this.cfg?.templates,
          templates: this.cfg?.templates
        });
        return;
      }

      // Formatear fecha y hora para que sean legibles
      let formattedDate = appointment?.date ?? '';
      let formattedTime = appointment?.time ?? '';

      // Si la fecha viene en formato ISO (YYYY-MM-DD o ISO completo), formatear a DD/MM/YYYY
      if (formattedDate && typeof formattedDate === 'string') {
        try {
          const dateObj = new Date(formattedDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('es-MX', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        } catch (e) {
          console.warn('[OwnerEmailService] Error formateando fecha:', e);
        }
      }

      // Si el tiempo viene en formato ISO completo (con T), extraer solo HH:mm
      if (formattedTime && typeof formattedTime === 'string') {
        if (formattedTime.includes('T')) {
          // Formato ISO completo, extraer hora
          try {
            const timeObj = new Date(formattedTime);
            if (!isNaN(timeObj.getTime())) {
              formattedTime = timeObj.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
            }
          } catch (e) {
            console.warn('[OwnerEmailService] Error formateando tiempo:', e);
          }
        }
        // Si ya es HH:mm, dejarlo como está
      }

      console.log('[OwnerEmailService] Fecha formateada:', formattedDate);
      console.log('[OwnerEmailService] Hora formateada:', formattedTime);

      // Mapea los parámetros esperados por tu template en EmailJS
      const templateParams: Record<string, any> = {
        subject: 'Nueva solicitud de servicio',
        user_name: appointment?.name ?? '',
        user_email: appointment?.email ?? '',
        user_phone: appointment?.phone ?? '',
        service_type: appointment?.serviceType ?? '',
        preferred_date: formattedDate,
        preferred_time: formattedTime,
        date: formattedDate,  // También incluir como 'date' por si el template usa este nombre
        time: formattedTime,  // También incluir como 'time' por si el template usa este nombre
        notes: appointment?.notes ?? '',
        status: appointment?.status ?? 'Pendiente',
        created_at: (appointment?.createdAt instanceof Date)
          ? appointment.createdAt.toISOString()
          : new Date().toISOString(),
      };

      console.log('[OwnerEmailService] Enviando con serviceId:', this.cfg.serviceId);
      console.log('[OwnerEmailService] Template:', this.cfg.templates.requestService);
      console.log('[OwnerEmailService] Parámetros completos:', templateParams);

      const response = await emailjs.send(this.cfg.serviceId, this.cfg.templates.requestService, templateParams);
      
      console.info('[OwnerEmailService] EmailJS enviado correctamente. Response:', response);
    } catch (err) {
      console.error('[OwnerEmailService] Error enviando EmailJS:', err);
      throw err;
    }
  }

  /**
   * Verifica si EmailJS está configurado correctamente
   */
  isConfigured(): boolean {
    return !!(this.cfg && 
             this.cfg.publicKey && 
             this.cfg.serviceId && 
             this.cfg.templates);
  }
}
