import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      // Rutas del panel de cliente
      const isOnClientPanel = pathname.startsWith("/client");
      // Rutas del panel de agente
      const isOnAgentPanel = pathname.startsWith("/agent");
      // Rutas de API protegidas
      const isProtectedAPI = pathname.startsWith("/api/tickets") || 
                             pathname.startsWith("/api/comments");
      // Página de login
      const isOnLogin = pathname === "/login";
      // Página de registro
      const isOnRegister = pathname === "/register";

      // Si no está logueado y quiere acceder a rutas protegidas
      if (!isLoggedIn && (isOnClientPanel || isOnAgentPanel || isProtectedAPI)) {
        return false; // Redirige a /login
      }

      // Si está logueado y quiere ir al login o registro
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        const role = auth?.user?.role;
        const redirectUrl = role === "agent" ? "/agent" : "/client";
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      // Verificar acceso por rol
      if (isLoggedIn) {
        const role = auth?.user?.role;
        
        // Cliente intentando acceder al panel de agente
        if (isOnAgentPanel && role !== "agent") {
          return Response.redirect(new URL("/client", nextUrl));
        }
        
        // Agente intentando acceder al panel de cliente
        if (isOnClientPanel && role !== "client") {
          return Response.redirect(new URL("/agent", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [], // Los providers se configuran en auth.ts
} satisfies NextAuthConfig;