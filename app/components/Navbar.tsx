"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/store/useAuthModal";
import { servicesData } from "@/models/servicesData";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openModal, closeModal } = useAuthModal();
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modal if session exists
  useEffect(() => {
    if (session) closeModal();
  }, [session, closeModal]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    {
      label: "Services",
      dropdown: Object.keys(servicesData).map((slug) => ({
        href: `/services/${slug}`,
        label: servicesData[slug].title,
      })),
    },
    { href: "/", label: "Products" },//we redirect to home later we create page 
    { href: "/career", label: "Career" },
    { href: "/blog", label: "Blog" },
  ];

  // Auth buttons
  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (status === "loading")
      return <span className={isMobile ? "text-gray-400" : "text-gray-500"}>Loading...</span>;

    if (session) {

      let profileRoute = "/"; // default
    switch (session.user.role) {
      case "admin":
        profileRoute = "/admindashboard";
        break;
      case "superadmin":
        profileRoute = "/admindashboard";
        break;
      case "jobseeker":
        profileRoute = "/jobseekerdashboard";
        break;
      case "employer":
        profileRoute = "/employerdashboard"
      // add more roles if needed
    }
      return (
        <button
          onClick={() => router.push(profileRoute)}
          className={`px-4 py-2 ${isMobile ? "w-full text-left" : ""} bg-blue-600 text-white rounded hover:bg-blue-700 transition`}
        >
          Profile
        </button>
      );
    }

    return (
      <div className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-2"}`}>
        <button

          onClick={() => openModal()}
          className={`px-4 py-2 ${isMobile ? "w-full text-left" : ""} border border-red-600 text-red-600 rounded hover:bg-red-50 transition`}
      
        >
          Admin Login
        </button>

        <button
          onClick={() => router.push("/choose-role")}
          className={`px-4 py-2 ${isMobile ? "w-full text-left" : ""} bg-blue-600 text-white rounded hover:bg-blue-700 transition`}
        >
          Sign Up
        </button>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={140} height={40} priority className="object-contain" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, idx) =>
            link.dropdown ? (
              <div key={idx} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setServicesOpen((prev) => !prev)}
                  className="inline-flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <span>{link.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${servicesOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-56 bg-gray-800 shadow-lg z-50 rounded-md"
                    >
                      {link.dropdown.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => setServicesOpen(false)}
                          className="block px-4 py-2 text-gray-100 hover:bg-gray-700 transition"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={idx}
                href={link.href}
                className={`${pathname === link.href ? "text-blue-600 font-semibold" : "text-gray-700"} hover:text-blue-600 transition`}
              >
                {link.label}
              </Link>
            )
          )}
          <AuthButtons />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 h-full w-64 bg-gray-800 text-white z-50 overflow-y-auto"
            >
              {navLinks.map((link, idx) =>
                link.dropdown ? (
                  <div key={idx} className="border-t border-gray-700">
                    <button
                      onClick={() => setMobileServicesOpen((prev) => !prev)}
                      className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-600 transition"
                    >
                      {link.label}
                      <ChevronDown
                        className={`h-4 w-4 transform transition-transform ${mobileServicesOpen ? "rotate-180" : "rotate-0"}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex flex-col bg-gray-700"
                        >
                          {link.dropdown.map((item, i) => (
                            <Link
                              key={i}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="px-6 py-2 text-sm text-gray-200 hover:bg-gray-600"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={idx}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 border-t border-gray-700 text-gray-100 hover:bg-gray-800 transition"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="border-t border-gray-700 px-4 py-3">
                <AuthButtons isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
