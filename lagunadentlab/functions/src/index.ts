/**
 * Firebase Cloud Functions para LagunadentLab
 * 
 * Esta función se ejecuta automáticamente cuando el estado de una cita cambia.
 * Si el estado cambia de "Pendiente" a "Aprobada", envía una notificación push
 * al usuario usando su token FCM guardado.
 * 
 * INSTALACIÓN:
 * 1. cd functions
 * 2. npm install
 * 3. firebase deploy --only functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

/**
 * Cloud Function que se dispara cuando una cita es actualizada
 * Detecta cambio de "Pendiente" -> "Aprobada" y envía notificación push
 */
export const onAppointmentStatusChange = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const appointmentId = context.params.appointmentId;

      // Verificar si el estado cambió de Pendiente a Aprobada
      const statusBefore = before.status || 'Pendiente';
      const statusAfter = after.status;

      if (statusBefore === 'Pendiente' && statusAfter === 'Aprobada') {
        console.log(`[FCM] Cita ${appointmentId} aprobada, enviando notificación...`);

        // Obtener información del usuario
        const userId = after.uid;
        if (!userId) {
          console.error('[FCM] No se encontró uid en la cita');
          return null;
        }

        // Obtener token FCM del usuario
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData || !userData.fcmToken) {
          console.warn(`[FCM] Usuario ${userId} no tiene token FCM registrado`);
          return null;
        }

        const fcmToken = userData.fcmToken;

        // Preparar mensaje de notificación
        const message = {
          notification: {
            title: '✅ ¡Cita Aprobada!',
            body: `Tu cita para ${after.serviceType || 'el servicio'} ha sido aprobada`,
          },
          data: {
            appointmentId: appointmentId,
            type: 'appointment_approved',
            date: after.date ? after.date.toString() : '',
            time: after.time || '',
          },
          token: fcmToken,
          android: {
            notification: {
              icon: 'ic_notification',
              color: '#4CAF50',
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        // Enviar notificación
        try {
          const response = await admin.messaging().send(message);
          console.log('[FCM] Notificación enviada exitosamente:', response);

          // Marcar que la notificación fue enviada
          await change.after.ref.update({
            pushNotificationSent: true,
            pushNotificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error: any) {
          console.error('[FCM] Error al enviar notificación:', error);

          // Si el token es inválido, eliminarlo del usuario
          if (error?.code === 'messaging/invalid-registration-token' ||
              error?.code === 'messaging/registration-token-not-registered') {
            await admin.firestore().collection('users').doc(userId).update({
              fcmToken: admin.firestore.FieldValue.delete(),
            });
            console.log('[FCM] Token FCM inválido eliminado del usuario');
          }
        }
      }

      return null;
    } catch (error) {
      console.error('[FCM] Error en Cloud Function:', error);
      return null;
    }
  });

/**
 * Cloud Function para enviar notificaciones manuales (opcional)
 * Útil para testing o envíos administrativos
 */
export const sendTestNotification = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const userId = data.userId || context.auth.uid;
    
    // Obtener token del usuario
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.fcmToken) {
      throw new functions.https.HttpsError('not-found', 'Token FCM no encontrado');
    }

    const message = {
      notification: {
        title: data.title || 'Notificación de Prueba',
        body: data.body || 'Esta es una notificación de prueba',
      },
      token: userData.fcmToken,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('[FCM] Error en sendTestNotification:', error);
    throw new functions.https.HttpsError('internal', 'Error al enviar notificación');
  }
});
