// import { NextRequest, NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// interface EmailRequestBody {
//   email: string;
//   mensajeHtml: string;
//   asunto: string;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json() as EmailRequestBody;
//     const { email, mensajeHtml, asunto } = body;

//     if (!email || !mensajeHtml || !asunto) {
//       return NextResponse.json(
//         { error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     const userMail = process.env.MAIL_USER;
//     const passMail = process.env.MAIL_PASS;

//     if (!userMail || !passMail) {
//       console.error("Faltan variables de entorno MAIL_USER o MAIL_PASS");
//       return NextResponse.json(
//         { error: "Configuración de email incompleta" },
//         { status: 500 }
//       );
//     }

//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: userMail,
//         pass: passMail,
//       },
//     });

//     await transporter.sendMail({
//       from: '"App Waggy Pets" <no-reply@appwaggypets.com>',
//       to: email,
//       subject: asunto,
//       html: mensajeHtml,
//       text: mensajeHtml,
//     });

//     return NextResponse.json(
//       { message: "Mensaje enviado correctamente" },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Error enviando email:", error);
//     const errorMessage = error instanceof Error ? error.message : "Error desconocido";
//     return NextResponse.json(
//       { error: "Error al enviar el email", details: errorMessage },
//       { status: 500 }
//     );
//   }
// }