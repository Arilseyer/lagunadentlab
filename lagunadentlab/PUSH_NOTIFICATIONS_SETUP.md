# 📱 Configuración de Notificaciones Push Nativas

## ✅ Implementación Completada

Se ha implementado el sistema de notificaciones push nativas usando `@capacitor/push-notifications` y Firebase Cloud Messaging (FCM).

---

## 🚀 Pasos para Completar la Configuración

### 1️⃣ Configurar Firebase Cloud Messaging (FCM)

#### **A. Obtener el archivo de configuración de Firebase**

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto `lagunadentlab`
3. Ve a **Configuración del proyecto** (ícono de engranaje)

#### **Para Android:**
1. En la sección **Tus apps**, agrega una app Android si no existe
2. **Package name**: Cambia el `appId` en `capacitor.config.ts` de `io.ionic.starter` a algo único como `com.lagunadentlab.app`
3. Descarga el archivo `google-services.json`
4. Colócalo en: `android/app/google-services.json`

#### **Para iOS:**
1. En la sección **Tus apps**, agrega una app iOS si no existe
2. **Bundle ID**: Usa el mismo que el `appId` (ej: `com.lagunadentlab.app`)
3. Descarga el archivo `GoogleService-Info.plist`
4. Colócalo en: `ios/App/App/GoogleService-Info.plist`

---

### 2️⃣ Actualizar el appId en Capacitor

Edita `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.lagunadentlab.app', // ⬅️ CAMBIAR ESTO
  appName: 'LagunadentLab',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};
```

---

### 3️⃣ Configurar Permisos Android

El archivo `android/app/src/main/AndroidManifest.xml` debe tener:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

Estos permisos ya deberían estar si usas Capacitor 7+.

---

### 4️⃣ Configurar Permisos iOS

Edita `ios/App/App/Info.plist` y agrega:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

En Xcode, también debes:
1. Abrir el proyecto: `npx cap open ios`
2. Ir a **Signing & Capabilities**
3. Agregar capability: **Push Notifications**
4. Agregar capability: **Background Modes** → Activar "Remote notifications"

---

### 5️⃣ Instalar Firebase Cloud Functions

Las Cloud Functions detectan cambios de estado de citas y envían notificaciones automáticamente.

```bash
# Instalar Firebase CLI globalmente (si no lo tienes)
npm install -g firebase-tools

# Autenticarte en Firebase
firebase login

# Ir a la carpeta functions
cd functions

# Instalar dependencias
npm install

# Desplegar las functions
firebase deploy --only functions
```

**Nota**: Firebase Functions requiere el **plan Blaze** (pago por uso), pero es muy económico:
- Primeras 2 millones de invocaciones/mes: **GRATIS**
- Después: ~$0.40 por millón de invocaciones

---

### 6️⃣ Actualizar Firestore Security Rules (Opcional)

Para permitir que los usuarios actualicen sus tokens FCM:

```javascript
// En firestore.rules
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  // Permitir actualizar solo el token FCM
  allow update: if request.auth != null 
    && request.auth.uid == userId 
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['fcmToken', 'fcmTokenUpdatedAt', 'platform']);
}
```

---

### 7️⃣ Compilar y Sincronizar con Capacitor

```bash
# Compilar la app web
npm run build

# Sincronizar con plataformas nativas
npx cap sync

# Ejecutar en Android
npx cap run android

# Ejecutar en iOS (solo en Mac)
npx cap run ios
```

---

## 🧪 Testing de Notificaciones

### Probar en desarrollo:

1. **Compilar y sincronizar**:
   ```bash
   npm run build
   npx cap sync
   ```

2. **Ejecutar en dispositivo físico** (las notificaciones push NO funcionan en emuladores):
   ```bash
   npx cap run android
   # o
   npx cap run ios
   ```

3. **Aprobar una cita desde el panel admin**:
   - Inicia sesión con un usuario normal en el dispositivo
   - Inicia sesión con un admin en el navegador web
   - Aprueba una cita pendiente del usuario
   - El usuario debería recibir la notificación push 🎉

### Probar función manual:

Puedes probar el envío de notificaciones manualmente desde la consola de Firebase:

```bash
firebase functions:shell
```

Luego ejecuta:
```javascript
sendTestNotification({userId: 'USER_ID_AQUI', title: 'Test', body: 'Mensaje de prueba'})
```

---

## 📊 Estructura de Datos en Firestore

### Colección `users`:
```javascript
{
  uid: "abc123",
  email: "user@example.com",
  name: "Juan Pérez",
  fcmToken: "dXnV6P_w...", // ⬅️ Token FCM del dispositivo
  fcmTokenUpdatedAt: Timestamp,
  platform: "android" // o "ios"
}
```

### Colección `appointments`:
```javascript
{
  id: "xyz789",
  uid: "abc123",
  status: "Aprobada", // Cambio de "Pendiente" -> "Aprobada" dispara notificación
  serviceType: "Limpieza Dental",
  date: Timestamp,
  time: "10:00 AM",
  pushNotificationSent: true, // ⬅️ Marcador de notificación enviada
  pushNotificationSentAt: Timestamp
}
```

---

## 💰 Costos Resumidos

| Servicio | Costo |
|----------|-------|
| Firebase Cloud Messaging (FCM) | **GRATIS** (hasta 10M mensajes/mes) |
| Firebase Cloud Functions | **Plan Blaze** (2M invocaciones gratis/mes) |
| Notificaciones iOS (APNs) | **GRATIS** + $99/año cuenta Apple Developer |
| Notificaciones Android | **GRATIS** |

**Total estimado para app pequeña/mediana**: ~$0-5 USD/mes

---

## 🔧 Troubleshooting

### Las notificaciones no llegan:

1. **Verifica que el token se guardó en Firestore**:
   - Abre la consola de Firebase
   - Ve a Firestore Database
   - Busca el usuario en la colección `users`
   - Verifica que tiene el campo `fcmToken`

2. **Verifica los logs de Cloud Functions**:
   ```bash
   firebase functions:log
   ```

3. **Verifica permisos del dispositivo**:
   - Android: Settings → Apps → LagunadentLab → Notifications → Activado
   - iOS: Settings → Notifications → LagunadentLab → Activado

4. **Verifica que estás en un dispositivo físico** (no emulador)

### Error "Token inválido":
- El token puede expirar o cambiar
- La Cloud Function automáticamente lo elimina si es inválido
- El usuario debe volver a iniciar sesión para generar un nuevo token

---

## 📚 Documentación Adicional

- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

---

## ✨ Características Implementadas

✅ Registro automático de tokens FCM al iniciar sesión  
✅ Notificaciones push cuando una cita cambia de "Pendiente" → "Aprobada"  
✅ Listeners para notificaciones en foreground y background  
✅ Navegación automática al tocar la notificación  
✅ Limpieza de tokens al cerrar sesión  
✅ Cloud Function automática para envío de notificaciones  
✅ Manejo de tokens inválidos/expirados  
✅ Compatible con Android e iOS  
✅ Fallback a notificaciones web en navegador  

---

¡Las notificaciones push están listas para usar! 🎉
