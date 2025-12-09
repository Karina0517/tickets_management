import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/dbConnection";
import User from "@/models/User";
import { authConfig } from "../auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña son requeridos");
          }

          await connectToDB();

          const user = await User.findOne({ 
            email: (credentials.email as string).toLowerCase().trim() 
          });

          if (!user) {
            throw new Error("Credenciales inválidas");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Credenciales inválidas");
          }

          // Retornar el usuario para NextAuth
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            cc: user.cc,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      // Cuando el usuario inicia sesión, agregar datos al token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.cc = user.cc;
      }
      return token;
    },

    async session({ session, token }) {
      // Pasar datos del token a la sesión
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.cc = token.cc;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`Usuario ${user.email} inició sesión`);
    },
    async signOut() {
      console.log("Usuario cerró sesión");
    },
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});