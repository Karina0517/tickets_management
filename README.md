# HelpDeskPro - Sistema de Gestión de Tickets 🎫  

**HelpDeskPro** es una web diseñada para centralizar y optimizar el soporte técnico de la empresa. Este sistema permite gestionar incidentes, asignar prioridades y mantener una comunicación fluida entre clientes y agentes, eliminando el caos de los correos sueltos y garantizando la trazabilidad de cada caso.

Construido con las últimas tecnologías web: **Next.js 15**, **TypeScript**, **MongoDB**, **NextAuth v5** y **Tailwind CSS**.

---

##  Funcionalidades Principales

*   **Roles y Permisos:** Vistas y capacidades diferenciadas para **Clientes** (reportar) y **Agentes** (resolver).
*   **Gestión de Tickets:** Ciclo de vida completo (Abierto, En Progreso, Resuelto, Cerrado) con niveles de prioridad.
*   **Comunicación:** Hilo de comentarios en tiempo real dentro de cada ticket.
*   **Notificaciones Automáticas:** Envío de correos electrónicos transaccionales (creación, respuesta y cierre) usando **Nodemailer** y **Gmail**.
*   **Automatización:** Cron Job inteligente para detectar tickets desatendidos (>24h) y alertar a los agentes.
*   **UI Robusta:** Componentes reutilizables y diseño responsivo con Tailwind CSS.

---

##  Requisitos Previos

Para ejecutar este proyecto localmente, necesitas:

1.  **Node.js** (v18.17.0 o superior).
2.  **MongoDB**: Una cadena de conexión válida (local o MongoDB Atlas).
3.  **Cuenta de Google (Gmail)**: Con la verificación de dos pasos activada y una **Contraseña de Aplicación** generada.

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo:

### 1. Clonar el repositorio

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd helpdeskpro
npm install
```

### Crea tu archivo .env 

### --- Base de Datos ---
### Ejemplo: mongodb+srv://usuario:password@cluster.mongodb.net/helpdesk_db
MONGODB_URI=TU_CONEXION_MONGODB

### --- Autenticación (NextAuth) ---
### Puedes generar uno nuevo en terminal con: openssl rand -base64 32
AUTH_SECRET=TU_SECRETO_GENERADO
NEXTAUTH_URL=http://localhost:3000

### --- Servicio de Correo (Gmail) ---
MAIL_USER=tu_correo_real@gmail.com
### IMPORTANTE: Usa la contraseña de aplicación de 16 dígitos (sin espacios)
MAIL_PASS=tu_contraseña_aplicacion

### --- Seguridad Cron Job ---
### Define una contraseña para proteger la ejecución de tareas automáticas
CRON_SECRET=TuClaveSecretaParaCron


```bash
npm run dev
```

### Credenciales de Acceso

Puedes utilizar las siguientes credenciales para probar los diferentes roles del sistema:

## Agentes
karinahenao1117807@correo.itm.edu.co
contraseña: 123456

karihz0517@hotmail.com
contraseña: 123456

maria@agente.com
contraseña: 123456


## Clientes
henaokarina17@gmail.com
contraseña: 123456

juan@cliente.com
contraseña: 123456


## Flujo de la Aplicación

![alt text](image.png)

### 1. Creación de Ticket (Cliente)
El cliente reporta un incidente llenando el formulario con título, descripción y prioridad.

![alt text](image-1.png)

![alt text](image-2.png)

### 2. Gestión de Tickets (Agente)
El agente visualiza el listado global, aplica filtros y gestiona los estados de los tickets.

![alt text](image-3.png)
![alt text](image-4.png)

### 3. Detalle y Comentarios
Vista detallada donde interactúan el cliente y el agente mediante comentarios.

![alt text](image-5.png)

![alt text](image-6.png)

![alt text](image-7.png)

![alt text](image-8.png)
---

## ⏰ Automatización (Cron Job)

El sistema cuenta con una tarea programada para evitar que los tickets queden en el olvido.

*   **Endpoint:** `/api/cron/reminders?key=TU_CRON_SECRET`
*   **Lógica:** Busca tickets en estado `open` creados hace más de 24 horas y envía un correo de recordatorio a los agentes.
*   **Cómo probar:** Visita la URL del endpoint en el navegador, está configurado en vercel cron, y se ejecuta diariamente a las 9 am.