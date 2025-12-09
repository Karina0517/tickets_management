"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/button/Button";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/client" className="text-xl font-bold text-blue-600">
                HelpDeskPro
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link
                  href="/client"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Mis Tickets
                </Link>
                <Link
                  href="/client/tickets/new"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Nuevo Ticket
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}