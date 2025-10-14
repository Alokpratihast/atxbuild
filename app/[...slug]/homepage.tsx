"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeroVideo from "@/components/HeroAndServices";
import IndustriesCarousel from "@/components/IndustriesCarousel";
import Hirecards from "@/components/Hireme";
import Startproject from "@/components/Startproject";

function HomeContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("scrollToContact") === "true") {
      const contactSection = document.getElementById("start-project");
      contactSection?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);

  return (
    <main>
      <HeroVideo />
      <IndustriesCarousel />
      <Hirecards />
      <section id="start-project">
        <Startproject />
      </section>
    </main>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading page...</div>}>
      <HomeContent />
    </Suspense>
  );
}
