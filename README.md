# lagunadentlab

PWA de Laguna Dent Lab

# 1. Instalar Ionic CLI globalmente (si no lo tienes)

npm install -g @ionic/cli


Flujo de trabajo recomendado

🔹 1️⃣ Configurar Git (solo la primera vez)

git config --global user.name "Tu Nombre"

git config --global user.email "tucorreo@ejemplo.com"

🔹 2️⃣ Clonar el repositorio

git clone https://github.com/Arilseyer/lagunadentlab.git

cd lagunadentlab

🔹 3️⃣ Cambiar a tu rama de trabajo

- Ver ramas locales:

git branch

- Ver ramas remotas:

git branch -r

- Ver ramas locales + remotas:

git branch -a

- Descargar todas las ramas remotas:

git fetch --all

git fetch origin

- Cada integrante trabajará en su rama específica:

git checkout diseño  # si es Angie o Xime

git checkout fanny  # si es Fanny

git checkout david  # si es David

(ANGIE Y XIME)

Proceso de trabajo individual

🧩 Para Angie y Xime (Diseño - HTML/CSS)

- Asegurarse de estar en la rama diseño.

git checkout diseño

- Crear o modificar archivos HTML, CSS o componentes visuales.

- Asegurar tener la versión más reciente

git pull origin diseño

- Verificar el estado:

git status

- Agregar y guardar cambios:

git add .

seguir estructura “Responsable: Cambio”

git commit -m "Angie: Actualizo estilos"

- Sincronizar con dev antes de subir:

git fetch origin

git pull origin dev

- Subir cambios:

git push origin diseño

- Crear un Pull Request en GitHub → hacia dev → Fanny revisa(Avisar a Fanny).


(FANNY)

⚙️ Para Fanny (Funcionalidad - Firebase / Lógica avanzada)

- Cambiar a la rama fanny:

git checkout fanny

- Implementar funciones principales, conexión con Firebase y manejo de base de datos.

- Revisar y agregar cambios:

git status

git add .

seguir estructura “Responsable: Cambio”

git commit -m "Fanny: Agrego conexión a Firebase"

- Mantener actualizada la rama:

git fetch origin

git pull origin dev

- Subir cambios:

git push origin fanny

- Crear Pull Request hacia funcionalidad y esperar revisión.

- Cuando la rama funcionalidad esté estable y probada Fanny hace Pull Request: funcionalidad → dev

(DAVID)

⚙️ Para David (Funcionalidad - Soporte y optimización)

- Cambiar a la rama david:

git checkout david

- Implementar optimizaciones, pruebas o pequeñas funciones.

- Guardar cambios:

git status

git add .

seguir estructura “Responsable: Cambio”

git commit -m "David: Optimizo funciones y corrijo errores menores"

- Actualizar rama:

git fetch origin

git pull origin dev

- Subir cambios:

git push origin david

- Crear Pull Request hacia funcionalidad y esperar revisión (Avisar a Fanny).

- Cuando la rama funcionalidad esté estable y probada Fanny hace Pull Request: funcionalidad → dev



🔄 Integración de ramas (por Fanny)

Fanny será la encargada de revisar y aprobar Pull Requests:

- Revisar los cambios en diseño, fanny y david.

- Fusionar primero a dev para pruebas.

- Probar el proyecto completo.

- Si todo funciona correctamente, hacer merge de dev → main.


🧠 Buenas prácticas del equipo

- Nunca trabajar directamente en main o dev.

- Actualizar la rama antes de subir cambios. Evita conflictos.

- Commits claros y frecuentes. Usa mensajes descriptivos.

- Realizar Pull Requests pequeños y constantes.

- Probar el código antes de hacer merge.

- Comunicación constante. Cualquier conflicto o duda → avisar a Fanny.
