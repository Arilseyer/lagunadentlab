# 🦷 Guía de Uso - Animación Lottie

## 📦 Instalación Completada

Ya se han instalado las siguientes dependencias:
- `ngx-lottie` - Wrapper de Angular para Lottie
- `lottie-web` - Motor de animación Lottie

## 📁 Estructura de Archivos

```
src/
├── assets/
│   └── animations/
│       └── clean-tooth.json  ← Tu animación de diente
└── app/
    └── components/
        └── lottie-loader/
            └── lottie-loader.component.ts  ← Componente reutilizable
```

## 🎨 Componente Creado: `LottieLoaderComponent`

### Características:
- ✅ Animación loop automática
- ✅ Modo fullscreen o embebido
- ✅ Mensaje personalizable
- ✅ Ruta de animación configurable
- ✅ Responsive

### Props (Inputs):

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `message` | string | `'Cargando...'` | Texto debajo de la animación |
| `fullscreen` | boolean | `false` | Si `true`, cubre toda la pantalla |
| `animationPath` | string | `'assets/animations/clean-tooth.json'` | Ruta al JSON de Lottie |

## 🚀 Ejemplos de Uso

### 1️⃣ Loading Fullscreen (implementado en Profile)

```html
<app-lottie-loader 
  *ngIf="loading" 
  [fullscreen]="true"
  [message]="'Cargando tu perfil...'"
></app-lottie-loader>
```

```typescript
// En el componente:
loading: boolean = true;

async loadData() {
  this.loading = true;
  try {
    // ... cargar datos
  } finally {
    this.loading = false;
  }
}
```

### 2️⃣ Loading Inline (dentro de una sección)

```html
<ion-card>
  <ion-card-content>
    <app-lottie-loader 
      *ngIf="loadingAppointments"
      [message]="'Cargando citas...'"
    ></app-lottie-loader>
    
    <div *ngIf="!loadingAppointments">
      <!-- Contenido de las citas -->
    </div>
  </ion-card-content>
</ion-card>
```

### 3️⃣ Sin mensaje

```html
<app-lottie-loader 
  [fullscreen]="true"
></app-lottie-loader>
```

### 4️⃣ Con otra animación

```html
<app-lottie-loader 
  [animationPath]="'assets/animations/otra-animacion.json'"
  [message]="'Procesando...'"
></app-lottie-loader>
```

## 🔧 Cómo Usar en Otras Páginas

### Paso 1: Importar el componente

```typescript
import { LottieLoaderComponent } from '../../components/lottie-loader/lottie-loader.component';

@Component({
  // ...
  imports: [
    // ... otros imports
    LottieLoaderComponent
  ]
})
```

### Paso 2: Agregar propiedad loading

```typescript
export class TuPaginaPage {
  loading: boolean = false;
  
  async cargarDatos() {
    this.loading = true;
    try {
      // ... tu lógica
    } finally {
      this.loading = false;
    }
  }
}
```

### Paso 3: Usar en el template

```html
<app-lottie-loader 
  *ngIf="loading" 
  [fullscreen]="true"
  [message]="'Cargando datos...'"
></app-lottie-loader>

<div *ngIf="!loading">
  <!-- Tu contenido -->
</div>
```

## 🎯 Casos de Uso Recomendados

### ✅ Cuándo usar fullscreen="true"
- Carga inicial de página
- Envío de formularios importantes
- Procesos que bloquean toda la interacción

### ✅ Cuándo usar fullscreen="false" (inline)
- Carga de secciones específicas
- Actualización parcial de contenido
- Loading de listas o tablas

## 📱 Páginas donde puedes implementarlo

1. **Request Services** - Al enviar solicitud de cita
2. **Contact** - Al enviar mensaje de contacto
3. **Appointments** - Al cargar lista de citas
4. **Gallery** - Al cargar imágenes
5. **Home** - Carga inicial

## 🎨 Personalización de Estilos

Si necesitas cambiar el tamaño o apariencia, edita:
`src/app/components/lottie-loader/lottie-loader.component.ts`

```typescript
// Cambiar tamaño:
ng-lottie {
  width: 300px;  // Cambia este valor
  height: 300px; // Cambia este valor
}

// Cambiar color de fondo fullscreen:
.lottie-loader-container.fullscreen {
  background: rgba(255, 255, 255, 0.95); // Ajusta transparencia
}
```

## 🔍 Debugging

Si la animación no se muestra:

1. **Verifica que el archivo existe:**
   ```bash
   ls src/assets/animations/clean-tooth.json
   ```

2. **Revisa la consola del navegador** - El componente hace log cuando se crea:
   ```
   "Animación Lottie creada: [objeto]"
   ```

3. **Verifica imports:**
   - ¿Está `LottieLoaderComponent` en los imports del componente?
   - ¿Está `provideLottieOptions` en `main.ts`?

## 📚 Recursos Adicionales

- [Lottie Files](https://lottiefiles.com/) - Descargar más animaciones
- [ngx-lottie Docs](https://github.com/ngx-lottie/ngx-lottie)
- [Lottie Web](https://airbnb.io/lottie/)

## 🎉 ¡Listo!

Tu animación de diente está configurada y lista para usar en cualquier página.
