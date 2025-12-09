import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnection";
import Comment, { createCommentSchema } from "@/models/Comment";
import Ticket from "@/models/Ticket";
import { auth } from "@/auth";
import { sendNewCommentEmail } from "@/services/emailService";
import * as yup from "yup";
import mongoose from "mongoose";

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

    const comments = await Comment.find({ ticketId })
      .populate("author", "name email role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ comments });

  } catch (error) {
    console.error("Error GET comments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    await connectToDB();
    const body = await request.json();

    const ticket = await Ticket.findById(body.ticketId);
    if (!ticket) return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });

    const commentData = {
      ticketId: body.ticketId,
      author: session.user.id,
      message: body.message,
    };

    const validatedData = await createCommentSchema.validate(commentData, {
      abortEarly: false, 
      stripUnknown: true 
    });

    console.log("Intentando guardar comentario:", validatedData);
    const newComment = new Comment(validatedData);
    await newComment.save();
    console.log(" Comentario guardado con ID:", newComment._id);


    if (session.user.role === "agent" && ticket.status === "open") {
      await Ticket.findByIdAndUpdate(body.ticketId, { status: "in_progress" });
    }

    if (session.user.role === "agent") {

        sendNewCommentEmail(
        ticket as any,
        { message: body.message, authorName: session.user.name || "Agente" }
      ).catch(e => console.error("Error enviando email background:", e));
    }

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