import nodemailer from "nodemailer";
import { ITicketResponse } from "@/types";

// 1. Configuración del Transporter (Tu nueva configuración)
const userMail = process.env.MAIL_USER;
const passMail = process.env.MAIL_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Puerto SSL
  secure: true, // TRUE para puerto 465
  auth: {
    user: userMail,
    pass: passMail,
  },
});

// Función genérica de envío (Basada en tu ejemplo)
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!userMail || !passMail) {
      console.log("⚠️ Faltan variables MAIL_USER o MAIL_PASS en .env");
      return false;
    }

    await transporter.sendMail({
      from: '"HelpDeskPro Support" <no-reply@helpdeskpro.com>', // Adaptado al proyecto
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email enviado correctamente a: ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return false;
  }
}

// =================================================================
// Plantillas de Correo para el Sistema de Tickets
// =================================================================

// 1. Email: Ticket Creado
export async function sendTicketCreatedEmail(ticket: ITicketResponse): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Ticket Registrado</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${ticket.createdByName}</strong>,</p>
        <p>Hemos recibido tu solicitud de soporte correctamente.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 5px 0;"><strong>Ticket ID:</strong> #${ticket._id.slice(-6)}</p>
          <p style="margin: 5px 0;"><strong>Asunto:</strong> ${ticket.title}</p>
          <p style="margin: 5px 0;"><strong>Prioridad:</strong> ${ticket.priority}</p>
        </div>
        
        <p>Un agente revisará tu caso pronto.</p>
      </div>
    </div>
  `;

  return sendEmail(
    ticket.createdByEmail,
    `[HelpDeskPro] Ticket Recibido: ${ticket.title}`,
    html
  );
}

// 2. Email: Nueva Respuesta de Agente
export async function sendNewCommentEmail(
  ticket: ITicketResponse,
  comment: { message: string; authorName: string }
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Nueva Respuesta</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${ticket.createdByName}</strong>,</p>
        <p>El agente <strong>${comment.authorName}</strong> ha respondido a tu ticket:</p>
        
        <div style="background: #eef2ff; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #c7d2fe;">
          "${comment.message}"
        </div>
        
        <p>Puedes responder ingresando a tu panel de usuario.</p>
      </div>
    </div>
  `;

  return sendEmail(
    ticket.createdByEmail,
    `[HelpDeskPro] Nueva respuesta en Ticket #${ticket._id.slice(-6)}`,
    html
  );
}

// 3. Email: Ticket Cerrado
export async function sendTicketClosedEmail(ticket: ITicketResponse): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #374151; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Ticket Cerrado</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${ticket.createdByName}</strong>,</p>
        <p>Tu ticket <strong>"${ticket.title}"</strong> ha sido cerrado.</p>
        <p>Esperamos haber resuelto tu problema satisfactoriamente.</p>
      </div>
    </div>
  `;

  return sendEmail(
    ticket.createdByEmail,
    `[HelpDeskPro] Ticket Cerrado #${ticket._id.slice(-6)}`,
    html
  );
}

// 4. Email: Ticket Resuelto
export async function sendTicketResolvedEmail(ticket: ITicketResponse): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #10b981; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Ticket Resuelto</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${ticket.createdByName}</strong>,</p>
        <p>Tu ticket ha sido marcado como <strong>Resuelto</strong>.</p>
        <p>Si consideras que el problema persiste, por favor responde a este ticket.</p>
      </div>
    </div>
  `;

  return sendEmail(
    ticket.createdByEmail,
    `[HelpDeskPro] Solución propuesta para Ticket #${ticket._id.slice(-6)}`,
    html
  );
}