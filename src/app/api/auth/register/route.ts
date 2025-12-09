import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/dbConnection";
import User, { createUserSchema, formatYupErrors } from "@/models/User";
import * as yup from "yup";

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
      email: validatedData.email.toLowerCase() 
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
      role: validatedData.role || "client",
    });

    // Retornar usuario sin la contraseña
    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      cc: newUser.cc,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user: userResponse },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: formatYupErrors(error) },
        { status: 400 }
      );
    }

    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}