import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnection";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get("key");
    const secret = process.env.CRON_SECRET;

    // Validamos si coincide con la clave en .env (por Header o por URL)
    const isValid = 
      (secret && authHeader === `Bearer ${secret}`) || 
      (secret && queryKey === secret);

    if (!isValid) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectToDB();

    // Calcular fecha límite: Tickets creados hace más de 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Buscar tickets que sigan "open" y sean viejos
    const staleTickets = await Ticket.find({
      status: "open",
      createdAt: { $lt: twentyFourHoursAgo },
    }).populate("assignedTo");

    if (staleTickets.length === 0) {
      return NextResponse.json({ message: "No hay tickets pendientes de recordatorio" });
    }

    console.log(`⏰ Cron: Encontrados ${staleTickets.length} tickets sin atención.`);

    // Obtener todos los agentes (por si el ticket no tiene dueño)
    const allAgents = await User.find({ role: "agent" });
    const agentEmails = allAgents.map(a => a.email);

    let emailsSent = 0;

    // Procesar cada ticket y enviar correo
    for (const ticket of staleTickets) {
      // Link al panel de agente
      const ticketLink = `${process.env.NEXTAUTH_URL}/agent/tickets/${ticket._id}`;
      
      let recipients: string[] = [];
      
      if (ticket.assignedTo && typeof ticket.assignedTo === 'object' && 'email' in ticket.assignedTo) {
        recipients = [(ticket.assignedTo as any).email];
      } else {
        recipients = agentEmails;
      }

      if (recipients.length > 0) {
        // Enviar correo
        await transporter.sendMail({
          from: '"HelpDeskPro Bot" <no-reply@helpdeskpro.com>',
          to: recipients, 
          subject: `⏰ RECORDATORIO: Ticket pendiente #${ticket._id.toString().slice(-6)}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
              <h2 style="color: #d97706;">⚠️ Recordatorio de Ticket Sin Atención</h2>
              <p>El siguiente ticket lleva <strong>más de 24 horas abierto</strong> y requiere atención inmediata.</p>
              <ul>
                <li><strong>Título:</strong> ${ticket.title}</li>
                <li><strong>Cliente:</strong> ${ticket.createdByName}</li>
                <li><strong>Creado:</strong> ${new Date(ticket.createdAt || "").toLocaleString()}</li>
              </ul>
              <p>
                <a href="${ticketLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Ir al Ticket
                </a>
              </p>
            </div>
          `,
        });
        emailsSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      ticketsFound: staleTickets.length, 
      emailsSent 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error interno del servidor", details: errorMessage }, { status: 500 });
  }
}