import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnection";
import User from "@/models/User";
import { auth } from "@/auth";

// GET - Listar agentes (para asignar a tickets)
export async function GET() {
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
        { error: "Solo los agentes pueden ver esta información" },
        { status: 403 }
      );
    }

    await connectToDB();

    const agents = await User.find({ role: "agent" })
      .select("_id name email")
      .sort({ name: 1 });

    return NextResponse.json({ agents });

  } catch (error) {
    console.error("Error al obtener agentes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}