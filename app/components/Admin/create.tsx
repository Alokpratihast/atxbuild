"use client";

import SeoForm from "./SeoFormModal";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CreateSEO = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true); // show modal on page load

  const handleSubmit = async (data: any) => {
    const res = await fetch("/api/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      toast.success("SEO Created!");
      setIsOpen(false);         // close modal
      router.push("/dashboard/seo"); // redirect after creation
    } else {
      toast.error(result.error);
    }
  };

  return (
    <SeoForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateSEO;
