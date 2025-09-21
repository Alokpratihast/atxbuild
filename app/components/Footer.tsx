"use client";

import Link from "next/link";
import { servicesData } from "@/models/servicesData"; // import your services data

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-14 pb-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Company Info */}
          <div>
            <h4 className="text-2xl font-bold text-white mb-4">ATX Technologies</h4>
            <p className="mb-6 text-sm leading-relaxed max-w-lg text-gray-400">
              We are a growing software development company delivering high-quality web,
              mobile, and digital solutions. Our mission is to help businesses achieve
              more through innovation, design, and technology.
            </p>

            <div className="space-y-3 text-sm">
              <p className="flex items-center">
                <i className="bi bi-geo-alt-fill text-primary text-lg mr-2"></i>
                Baghmughaliya, Bhopal, MP
              </p>
              <p className="flex items-center">
                <i className="bi bi-envelope-fill text-primary text-lg mr-2"></i>
                info@atxtechnologies.in
              </p>
              <p className="text-xs text-gray-500">We respond within 24 hours</p>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Services */}
            <div>
              <h5 className="text-lg font-semibold text-white mb-4 border-l-4 border-primary pl-2">
                Services
              </h5>
              <ul className="space-y-2 text-sm">
                {Object.keys(servicesData).map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/services/${slug}`}
                      className="hover:text-blue-400 transition-colors duration-200"
                    >
                      {servicesData[slug].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-lg font-semibold text-white mb-4 border-l-4 border-primary pl-2">
                Quick Links
              </h5>
              <ul className="space-y-2 text-sm">
                {[
                  ["Blogs", "/blog"],
                  ["About Us", "/about"],
                  ["Careers", "/career"],
                  ["contact Us", "/#contact"],
                ].map(([name, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="hover:text-blue-400 transition-colors duration-200"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} ATX Technologies. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
