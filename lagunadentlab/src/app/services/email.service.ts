import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private initialized = false;

  private get cfg() {
    return environment.emailJsConfig;
  }

  private ensureInit() {
    if (!this.initialized && this.cfg?.publicKey) {
      console.log('[EmailService] Inicializando EmailJS con publicKey:', this.cfg.publicKey.substring(0, 10) + '...');
      emailjs.init(this.cfg.publicKey);
      this.initialized = true;
    } else if (!this.cfg?.publicKey) {
      console.warn('[EmailService] No se puede inicializar: publicKey está vacío');
    }
  }

  /**
   * Envía un correo de contacto general al propietario
   */
  async sendContactMessage(contactData: ContactMessage): Promise<void> {
    try {
      console.log('[EmailService] Iniciando envío de correo de contacto...');
      this.ensureInit();
      
      if (!this.isConfigured()) {
        console.warn('[EmailService] EmailJS no está configurado correctamente.');
        console.warn('[EmailService] Config actual:', {
          hasPublicKey: !!this.cfg?.publicKey,
          publicKey: this.cfg?.publicKey,
          hasServiceId: !!this.cfg?.serviceId,
          serviceId: this.cfg?.serviceId,
          hasTemplates: !!this.cfg?.templates,
          templates: this.cfg?.templates
        });
        return;
      }

      // Mapea los parámetros esperados por tu template de contacto en EmailJS
      const templateParams: Record<string, any> = {
        subject: 'Nuevo mensaje de contacto',
        from_name: contactData.name,
        from_email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
        status: contactData.status,
        created_at: contactData.createdAt instanceof Date
          ? contactData.createdAt.toISOString()
          : new Date().toISOString(),
      };

      console.log('[EmailService] Enviando con serviceId:', this.cfg.serviceId);
      console.log('[EmailService] Template:', this.cfg.templates.contactOwner);
      console.log('[EmailService] Parámetros:', templateParams);

      const response = await emailjs.send(
        this.cfg.serviceId, 
        this.cfg.templates.contactOwner, 
        templateParams
      );
      
      console.info('[EmailService] Correo de contacto enviado correctamente. Response:', response);
    } catch (error) {
      console.error('[EmailService] Error enviando correo de contacto:', error);
      throw error;
    }
  }

  /**
   * Envía un correo de confirmación al usuario
   */
  async sendConfirmationEmail(userEmail: string, userName: string, messageType: 'contact' | 'appointment'): Promise<void> {
    try {
      this.ensureInit();
      if (!this.cfg || !this.cfg.serviceId || !this.cfg.templates || this.cfg.publicKey === 'OwFETnPu6p8W-xQBI') {
        console.warn('[EmailService] Falta configurar EmailJS (publicKey/serviceId/templateId).');
        return;
      }

      const templateParams: Record<string, any> = {
        to_email: userEmail,
        to_name: userName,
        message_type: messageType === 'contact' ? 'mensaje de contacto' : 'solicitud de cita',
        company_name: 'Laguna Dent Lab',
        created_at: new Date().toISOString(),
      };

      // Usaríamos un template diferente para confirmaciones si lo tuvieras configurado
      // Por ahora, usar el mismo template de contacto o crear uno específico
      console.info('[EmailService] Funcionalidad de confirmación disponible pero requiere template específico.');
    } catch (error) {
      console.error('[EmailService] Error enviando correo de confirmación:', error);
      throw error;
    }
  }

  /**
   * Envía un correo personalizado
   */
  async sendCustomEmail(templateId: string, templateParams: Record<string, any>): Promise<void> {
    try {
      this.ensureInit();
      if (!this.cfg || !this.cfg.serviceId || this.cfg.publicKey === 'OwFETnPu6p8W-xQBI') {
        console.warn('[EmailService] Falta configurar EmailJS (publicKey/serviceId).');
        return;
      }

      await emailjs.send(this.cfg.serviceId, templateId, templateParams);
      console.info('[EmailService] Correo personalizado enviado correctamente.');
    } catch (error) {
      console.error('[EmailService] Error enviando correo personalizado:', error);
      throw error;
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