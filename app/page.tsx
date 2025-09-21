"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import HeroVideo from "@/components/HeroAndServices";
import IndustriesCarousel from "@/components/IndustriesCarousel";
import Hirecards from "@/components/Hireme"; 
import Startproject from "@/components/Startproject";
import { Suspense } from "react"; // ✅ Add this

function HomeContent() {  // ✅ New inner component
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("scrollToContact") === "true") {
      const contactSection = document.getElementById("start-project");
      contactSection?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);

  return (
    <>
      <HeroVideo />
      <main>
        <IndustriesCarousel />
        <Hirecards />
        <section id="start-project">
          <Startproject />
        </section>
      </main>
    </>
  );
}

// ✅ Wrap HomeContent with Suspense
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
