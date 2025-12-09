import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // 1. Obtener la respuesta base que genera NextAuth
  const response = NextResponse.next();

  // 2. Definir rutas protegidas (Paneles)
  const isProtectedPath = 
    req.nextUrl.pathname.startsWith("/client") || 
    req.nextUrl.pathname.startsWith("/agent");

  // 3. Si es una ruta protegida, DESACTIVAR CACHÉ DEL NAVEGADOR
  if (isProtectedPath) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
  }

  return response;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/client/:path*", // Asegurar que coincida con tus rutas
    "/agent/:path*",  // Asegurar que coincida con tus rutas
    "/api/dashboard/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};