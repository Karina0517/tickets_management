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

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/63a78580-b9d3-4269-afa0-2c109b487fe1" />


### 1. Creación de Ticket (Cliente)
El cliente reporta un incidente llenando el formulario con título, descripción y prioridad.

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/1e5d73f4-6072-4611-81a9-dce585bf32b2" />

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/876e0854-2eda-4b72-9848-c839cd545c4a" />



### 2. Gestión de Tickets (Agente)
El agente visualiza el listado global, aplica filtros y gestiona los estados de los tickets.

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/e519b5ad-22be-4f9a-8791-8408c35d9450" />


### 3. Detalle y Comentarios
Vista detallada donde interactúan el cliente y el agente mediante comentarios.

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/a408ab2b-d797-4b77-9cbf-95dc08588d45" />

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/a076fe9b-7d02-43b2-a88d-a49f20b20631" />

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/c3763af6-c32b-4a78-992a-4fee9bb7ac9a" />

<img width="1592" height="933" alt="image" src="https://github.com/user-attachments/assets/7e1ae68d-3e19-4204-9fa2-0bcbf7c91f03" />



---

## ⏰ Automatización (Cron Job)

El sistema cuenta con una tarea programada para evitar que los tickets queden en el olvido.

*   **Endpoint:** `/api/cron/reminders?key=TU_CRON_SECRET`
*   **Lógica:** Busca tickets en estado `open` creados hace más de 24 horas y envía un correo de recordatorio a los agentes.
*   **Cómo probar:** Visita la URL del endpoint en el navegador, está configurado en vercel cron, y se ejecuta diariamente a las 9 am.
