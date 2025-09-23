"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthModal } from "@/store/useAuthModal";
import AuthPage from "@/components/Menupages/SignUpForm"; // your unified form

export default function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <DialogHeader>
          <DialogTitle className="text-center"></DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <AuthPage />
        </div>
      </DialogContent>
    </Dialog>
  );
}
