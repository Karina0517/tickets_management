import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnection";
import Comment, { createCommentSchema } from "@/models/Comment";
import Ticket from "@/models/Ticket";
import { auth } from "@/auth";
import { sendNewCommentEmail } from "@/services/emailService";
import * as yup from "yup";
import mongoose from "mongoose";

// GET - Obtener comentarios por ticketId
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await connectToDB();

    // Buscar en la colección 'messages' (definida en el modelo)
    const comments = await Comment.find({ ticketId })
      .populate("author", "name email role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ comments });

  } catch (error) {
    console.error("Error GET comments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST - Crear comentario
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    await connectToDB();
    const body = await request.json();

    // 1. Validar existencia del ticket
    const ticket = await Ticket.findById(body.ticketId);
    if (!ticket) return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });

    // 2. Preparar datos
    const commentData = {
      ticketId: body.ticketId,
      author: session.user.id,
      message: body.message,
    };

    // 3. Validar con Yup
    const validatedData = await createCommentSchema.validate(commentData, {
      abortEarly: false, 
      stripUnknown: true 
    });

    // 4. GUARDAR EN BD (Colección 'messages')
    console.log("Intentando guardar comentario:", validatedData);
    const newComment = new Comment(validatedData);
    await newComment.save();
    console.log("✅ Comentario guardado con ID:", newComment._id);

    // 5. Actualizar estado del ticket si responde un agente
    if (session.user.role === "agent" && ticket.status === "open") {
      await Ticket.findByIdAndUpdate(body.ticketId, { status: "in_progress" });
    }

    // 6. Enviar Email (Ya probamos que funciona)
    if (session.user.role === "agent") {
      // No esperamos el email para no bloquear la respuesta
      sendNewCommentEmail(
        ticket as any,
        { message: body.message, authorName: session.user.name || "Agente" }
      ).catch(e => console.error("Error enviando email background:", e));
    }

    // 7. Retornar respuesta poblada
    const populatedComment = await Comment.findById(newComment._id)
      .populate("author", "name email role");

    return NextResponse.json(
      { message: "Comentario creado", comment: populatedComment }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error POST comment:", error);
    if (error instanceof yup.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}