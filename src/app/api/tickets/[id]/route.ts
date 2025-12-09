import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnection";
import Ticket, { updateTicketSchema, formatYupErrors } from "@/models/Ticket";
import { auth } from "@/auth";
import { sendTicketClosedEmail, sendTicketResolvedEmail } from "@/services/emailService";
import * as yup from "yup";
import mongoose from "mongoose";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de ticket inválido" },
        { status: 400 }
      );
    }

    await connectToDB();

    const ticket = await Ticket.findById(id)
      .populate("assignedTo", "name email");

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "client" && 
      ticket.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este ticket" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ticket });

  } catch (error) {
    console.error("Error al obtener ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de ticket inválido" },
        { status: 400 }
      );
    }

    await connectToDB();

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (session.user.role === "client") {
      if (ticket.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permiso para modificar este ticket" },
          { status: 403 }
        );
      }
      if (body.status === "resolved" || body.status === "closed" || body.assignedTo) {
        return NextResponse.json(
          { error: "No tienes permiso para realizar esta acción" },
          { status: 403 }
        );
      }
    }

    // Solo agentes pueden cambiar status y asignar
    if (session.user.role === "agent") {
      // Guardar estado anterior para comparar
      const previousStatus = ticket.status;

      // Validar datos
      const validatedData = await updateTicketSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });

      // Actualizar ticket
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        { $set: validatedData },
        { new: true, runValidators: true }
      ).populate("assignedTo", "name email");

      // Enviar emails según cambio de estado
      if (validatedData.status && validatedData.status !== previousStatus) {
        // Datos para el email
        const ticketData = {
          _id: updatedTicket!._id.toString(),
          title: updatedTicket!.title,
          description: updatedTicket!.description,
          createdBy: updatedTicket!.createdBy.toString(),
          createdByCC: updatedTicket!.createdByCC,
          createdByName: updatedTicket!.createdByName,
          createdByEmail: updatedTicket!.createdByEmail,
          assignedTo: null,
          status: updatedTicket!.status,
          priority: updatedTicket!.priority,
          createdAt: updatedTicket!.createdAt?.toISOString() || "",
          updatedAt: updatedTicket!.updatedAt?.toISOString() || "",
        };

        if (validatedData.status === "closed") {
          await sendTicketClosedEmail(ticketData);
        } else if (validatedData.status === "resolved") {
          await sendTicketResolvedEmail(ticketData);
        }
      }

      return NextResponse.json({
        message: "Ticket actualizado exitosamente",
        ticket: updatedTicket,
      });
    }

    // Para clientes (actualizaciones permitidas)
    const validatedData = await updateTicketSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: "Ticket actualizado exitosamente",
      ticket: updatedTicket,
    });

  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: formatYupErrors(error) },
        { status: 400 }
      );
    }

    console.error("Error al actualizar ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "agent") {
      return NextResponse.json(
        { error: "Solo los agentes pueden eliminar tickets" },
        { status: 403 }
      );
    }

    const params = await props.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de ticket inválido" },
        { status: 400 }
      );
    }

    await connectToDB();

    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Ticket eliminado exitosamente",
    });

  } catch (error) {
    console.error("Error al eliminar ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
