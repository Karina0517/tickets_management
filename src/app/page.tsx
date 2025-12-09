import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  // Si hay sesión, redirigir según el rol
  if (session?.user) {
    if (session.user.role === "agent") {
      redirect("/agent");
    } else {
      redirect("/client");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">HelpDeskPro</h1>
        <p className="text-xl mb-8">Sistema de Gestión de Tickets de Soporte</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}