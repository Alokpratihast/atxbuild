import { create } from "zustand";

type ModalType = "auth" | null; // only one modal now

interface AuthModalStore {
  isOpen: boolean;
  type: ModalType;
  openModal: () => void;
  closeModal: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  type: null,
  openModal: () => set({ isOpen: true, type: "auth" }),
  closeModal: () => set({ isOpen: false, type: null }),
}));
