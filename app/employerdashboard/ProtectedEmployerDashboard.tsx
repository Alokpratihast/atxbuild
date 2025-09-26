// components/ProtectedEmployerDashboard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedProps {
  children: ReactNode;
}

export default function ProtectedEmployerDashboard({ children }: ProtectedProps) {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or role is not employer
    if (status === "unauthenticated" || session?.user.role !== "employer") {
      router.replace("/"); // redirect to home/login
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;

  return <>{children}</>;
}
