"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login"); //Para que no pueda volver atrás
    }
  }, [status, router]);

  const logout = async () => {
    await signOut({ 
      redirect: true, 
      callbackUrl: "/login"
    });
  };

  const isClient = user?.role === "client";
  const isAgent = user?.role === "agent";

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isClient,
    isAgent,
    logout,
  };
}