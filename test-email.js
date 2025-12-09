// test-email.js
require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

async function test() {
    console.log("1. Leyendo credenciales...");
    const user = "henaokarina17@gmail.com";
    const pass = "kxvmqeprzoguszfr";

    console.log(`   Usuario: ${user}`);
    console.log(`   Pass (longitud): ${pass ? pass.length : 0} caracteres`);

    if (!user || !pass) {
        console.error("❌ ERROR: Faltan variables en .env");
        return;
    }

    console.log("2. Configurando transporte (Gmail SSL 465)...");
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: pass,
        },
    });

    console.log("3. Intentando enviar...");
    try {
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: user, // Te lo envías a ti mismo
            subject: "Prueba de Credenciales ✅",
            text: "Si lees esto, las credenciales funcionan perfectamente.",
        });
        console.log("✅ ÉXITO TOTAL. El correo se envió.");
        console.log("ID del mensaje:", info.messageId);
    } catch (error) {
        console.error("❌ FALLÓ EL ENVÍO:");
        console.error(error);
    }
}

test();