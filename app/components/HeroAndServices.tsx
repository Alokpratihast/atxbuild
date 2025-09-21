"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { servicesData } from "@/models/servicesData";

const HeroAndServices: React.FC = () => {
  const servicesArray = Object.keys(servicesData).map((slug) => ({
    slug,
    ...servicesData[slug],
  }));

  return (
    <>
<section className="relative w-full h-[60vh] sm:h-screen flex items-center justify-center overflow-hidden">
  {/* Video Container fills entire section */}
  <div className="w-full h-full relative">
    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    >
      <source src="/CodeCraft.mp4" type="video/mp4" />
    </video>

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/30"></div>
  </div>

  {/* Button */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
  >
    <a
      href="#start-project"
      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-base sm:text-lg transition-all duration-300"
    >
      Start a Project →
    </a>
  </motion.div>
</section>




      {/* Technology and Expertise Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-center mb-12 font-bold text-3xl sm:text-4xl text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Technology and Expertise
          </motion.h2>

          <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {servicesArray.map((service, index) => (
              <motion.div
                key={service.slug}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {service.title}
                  </h5>
                  <p className="text-gray-600 text-sm sm:text-base">{service.description}</p>
                </div>

                {/* Dynamic "View More" Link */}
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base transition-colors duration-300"
                >
                  View More →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroAndServices;