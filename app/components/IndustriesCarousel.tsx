"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const industries = [
  [
    { src: "/retail.jpg", title: "Retail" },
    { src: "/telecommunication.jpg", title: "Telecommunication" },
    { src: "/healthcare.jpg", title: "Healthcare" },
    { src: "/E-commerce.jpg", title: "E-Commerce" },
  ],
  [
    { src: "/erp.jpg", title: "ERP" },
    { src: "/entertainment.jpg", title: "Entertainment" },
    { src: "/finance.jpg", title: "Finance" },
    { src: "/manufacturing.jpg", title: "Manufacturing" },
  ],
];

export default function IndustriesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? industries.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === industries.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto text-center relative z-10 px-4">
        {/* Heading */}
        <h2 className="font-extrabold mb-12 text-gray-900 text-2xl md:text-4xl">
          Our Expertise Drives Success In <span className="text-blue-600">Every Industry</span>
        </h2>

        {/* Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-8 flex-wrap"
          >
            {industries[activeIndex].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.08 }}
                className="text-center group"
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden border-4 border-blue-500 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
                <h6 className="mt-4 text-gray-800 font-medium text-sm sm:text-base group-hover:text-blue-600 transition">
                  {item.title}
                </h6>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex justify-center mt-10 gap-6">
          <button
            onClick={prevSlide}
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-500 transition"
          >
            ◀
          </button>
          <button
            onClick={nextSlide}
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-500 transition"
          >
            ▶
          </button>
        </div>
      </div>
    </section>
  );
}
