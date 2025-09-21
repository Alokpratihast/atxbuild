"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ClientScrollProps {
  sectionId: string;
}

export default function ClientScroll({ sectionId }: ClientScrollProps) {
  const searchParams = typeof window !== "undefined" ? useSearchParams() : null;

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get("scrollToContact") === "true") {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams, sectionId]);

  return null;
}
