"use client";

import { useRouter } from "next/navigation";

interface GetInTouchButtonProps {
  label?:string;
  homePath?: string;
  contactId?: string;
  className?: string;
}

export default function GetInTouchButton({
  homePath = "/",
  contactId = "start-project",
  className = "bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700",
}: GetInTouchButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.location.pathname === homePath) {
      const contactSection = document.getElementById(contactId);
      contactSection?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`${homePath}?scrollToContact=true`);
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      Get in Touch
    </button>
  );
}
