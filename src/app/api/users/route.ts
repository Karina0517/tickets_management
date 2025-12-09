import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/dbConnection";
import User, { createUserSchema, formatYupErrors } from "@/models/User";
import * as yup from "yup";

// POST - Crear usuario
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();

    // Validar datos con Yup
    const validatedData = await createUserSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({
      email: validatedData.email.toLowerCase(),
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si la cédula ya existe
    const existingCC = await User.findOne({ cc: validatedData.cc });
    if (existingCC) {
      return NextResponse.json(
        { error: "La cédula ya está registrada" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Crear el usuario
    const newUser = await User.create({
      name: validatedData.name.trim(),
      email: validatedData.email.toLowerCase().trim(),
      password: hashedPassword,
      cc: validatedData.cc.trim(),
      role: validatedData.role,
    });

    // Retornar usuario sin la contraseña
    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          cc: newUser.cc,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
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

    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Listar usuarios (opcional, útil para ver los usuarios creados)
export async function GET() {
  try {
    await connectToDB();

    const users = await User.find({})
      .select("-password") // Excluir contraseña
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}