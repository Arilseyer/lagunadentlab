import { Injectable } from '@angular/core';
import { OnlineService } from './online.service';
import { EmailService, ContactMessage } from './email.service';
import { OwnerEmailService } from './owner-email.service';
import { Subscription } from 'rxjs';

interface PendingEmail {
  id: string;
  type: 'contact' | 'appointment';
  data: any;
  timestamp: number;
  attempts: number;
}

@Injectable({ providedIn: 'root' })
export class PendingEmailsService {
  private readonly STORAGE_KEY = 'pendingEmails';
  private readonly MAX_ATTEMPTS = 3;
  private processing = false;
  private onlineSub?: Subscription;

  constructor(
    private onlineService: OnlineService,
    private emailService: EmailService,
    private ownerEmailService: OwnerEmailService
  ) {
    console.log('[PendingEmailsService] Servicio inicializado');
    
    // Procesar cola pendiente al iniciar si ya hay conexión
    if (this.onlineService.isOnline) {
      console.log('[PendingEmailsService] Conexión detectada al iniciar, procesando cola...');
      setTimeout(() => this.processQueue(), 2000); // Dar tiempo a que se inicialicen otros servicios
    }
    
    // Suscribirse a cambios de conexión para procesar automáticamente
    this.onlineSub = this.onlineService.isOnline$.subscribe(async (isOnline) => {
      console.log('[PendingEmailsService] Estado de conexión cambió:', isOnline ? 'ONLINE' : 'OFFLINE');
      if (isOnline && !this.processing) {
        console.log('[PendingEmailsService] Conexión recuperada, procesando emails pendientes...');
        // Pequeño delay para asegurar que la conexión esté estable
        setTimeout(() => this.processQueue(), 1000);
      }
    });
  }

  /**
   * Encola un email de contacto para enviar cuando haya conexión
   */
  enqueueContactEmail(contactData: ContactMessage): void {
    const pending: PendingEmail = {
      id: this.generateId(),
      type: 'contact',
      data: contactData,
      timestamp: Date.now(),
      attempts: 0
    };
    this.addToQueue(pending);
    console.log('[PendingEmailsService] Email de contacto encolado:', pending.id);
  }

  /**
   * Encola un email de cita para enviar cuando haya conexión
   */
  enqueueAppointmentEmail(appointmentData: any): void {
    const pending: PendingEmail = {
      id: this.generateId(),
      type: 'appointment',
      data: appointmentData,
      timestamp: Date.now(),
      attempts: 0
    };
    this.addToQueue(pending);
    console.log('[PendingEmailsService] Email de cita encolado:', pending.id);
  }

  /**
   * Procesa la cola de emails pendientes
   */
  async processQueue(): Promise<void> {
    if (this.processing) {
      console.log('[PendingEmailsService] Ya hay un proceso en curso, saltando...');
      return;
    }

    if (!this.onlineService.isOnline) {
      console.log('[PendingEmailsService] Sin conexión, no se puede procesar la cola');
      return;
    }

    this.processing = true;
    const queue = this.getQueue();
    
    if (queue.length === 0) {
      console.log('[PendingEmailsService] No hay emails pendientes');
      this.processing = false;
      return;
    }

    console.log(`[PendingEmailsService] Procesando ${queue.length} email(s) pendiente(s)...`);
    
    for (const email of queue) {
      try {
        await this.sendEmail(email);
        this.removeFromQueue(email.id);
        console.log(`[PendingEmailsService]  Email ${email.id} enviado correctamente`);
      } catch (error) {
        console.error(`[PendingEmailsService]  Error enviando email ${email.id}:`, error);
        
        // Incrementar intentos
        email.attempts++;
        
        if (email.attempts >= this.MAX_ATTEMPTS) {
          console.warn(`[PendingEmailsService] Email ${email.id} alcanzó máximo de intentos, eliminando...`);
          this.removeFromQueue(email.id);
        } else {
          // Actualizar en la cola con el nuevo número de intentos
          this.updateInQueue(email);
        }
      }
    }

    this.processing = false;
    console.log('[PendingEmailsService] Procesamiento de cola completado');
  }

  /**
   * Envía un email según su tipo
   */
  private async sendEmail(email: PendingEmail): Promise<void> {
    switch (email.type) {
      case 'contact':
        await this.emailService.sendContactMessage(email.data);
        break;
      case 'appointment':
        await this.ownerEmailService.sendAppointmentNotification(email.data);
        break;
      default:
        throw new Error(`Tipo de email desconocido: ${email.type}`);
    }
  }

  /**
   * Obtiene la cola desde localStorage
   */
  private getQueue(): PendingEmail[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[PendingEmailsService] Error leyendo cola:', error);
      return [];
    }
  }

  /**
   * Guarda la cola en localStorage
   */
  private saveQueue(queue: PendingEmail[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[PendingEmailsService] Error guardando cola:', error);
    }
  }

  /**
   * Añade un email a la cola
   */
  private addToQueue(email: PendingEmail): void {
    const queue = this.getQueue();
    queue.push(email);
    this.saveQueue(queue);
  }

  /**
   * Actualiza un email en la cola (por ejemplo, para incrementar intentos)
   */
  private updateInQueue(email: PendingEmail): void {
    const queue = this.getQueue();
    const index = queue.findIndex(e => e.id === email.id);
    if (index !== -1) {
      queue[index] = email;
      this.saveQueue(queue);
    }
  }

  /**
   * Elimina un email de la cola
   */
  private removeFromQueue(id: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter(e => e.id !== id);
    this.saveQueue(filtered);
  }

  /**
   * Genera un ID único para cada email pendiente
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Obtiene el número de emails pendientes
   */
  getPendingCount(): number {
    return this.getQueue().length;
  }

  /**
   * Limpia la cola completa (útil para debugging o reset)
   */
  clearQueue(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('[PendingEmailsService] Cola limpiada');
  }
}
