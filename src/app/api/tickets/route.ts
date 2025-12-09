import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnection";
import Ticket, { createTicketSchema, formatYupErrors, ITicket } from "@/models/Ticket";
import { auth } from "@/auth";
import { sendTicketCreatedEmail } from "@/services/emailService";
import * as yup from "yup";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    // Construir filtros
    const filters: Record<string, any> = {};

    // Si es cliente, solo ver sus tickets
    if (session.user.role === "client") {
      filters.createdBy = session.user.id;
    }

    // Filtros opcionales
    if (status && status !== "all") {
      filters.status = status;
    }

    if (priority && priority !== "all") {
      filters.priority = priority;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { createdByName: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(filters)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ tickets });

  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "client") {
      return NextResponse.json(
        { error: "Solo los clientes pueden crear tickets" },
        { status: 403 }
      );
    }

    await connectToDB();

    const body = await request.json();

    // Agregar datos del usuario autenticado
    const ticketData = {
      ...body,
      createdBy: session.user.id,
      createdByCC: session.user.cc,
      createdByName: session.user.name,
      createdByEmail: session.user.email,
      status: "open",
    };

    // Validar
    const validatedData = await createTicketSchema.validate(ticketData, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Crear ticket usando new + save (evita el problema de tipos)
    const newTicket = new Ticket(validatedData);
    await newTicket.save();

    // Enviar email de confirmación
    await sendTicketCreatedEmail({
      _id: newTicket._id.toString(),
      title: newTicket.title,
      description: newTicket.description,
      createdBy: newTicket.createdBy.toString(),
      createdByCC: newTicket.createdByCC,
      createdByName: newTicket.createdByName,
      createdByEmail: newTicket.createdByEmail,
      assignedTo: null,
      status: newTicket.status,
      priority: newTicket.priority,
      createdAt: newTicket.createdAt?.toISOString() || "",
      updatedAt: newTicket.updatedAt?.toISOString() || "",
    });

    return NextResponse.json(
      { 
        message: "Ticket creado exitosamente", 
        ticket: newTicket 
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: formatYupErrors(error) },
        { status: 400 }
      );
    }

    console.error("Error al crear ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}