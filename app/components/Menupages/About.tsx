"use client";

import Image from "next/image";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import GetInTouchButton from "../Aboutgettouch";
import ClientScroll from "@/components/ClientScroll";

type IconName = keyof typeof LucideIcons;

const Service: { icon: IconName; label: string; slug: string }[] = [
  { icon: "Smartphone", label: "App Development", slug: "app-development" },
  { icon: "Monitor", label: "Web Development", slug: "web-development" },
  { icon: "Cloud", label: "Cloud Infrastructure", slug: "cloud-infrastructure" },
  { icon: "Database", label: "Database Administration", slug: "database-administration" },
  { icon: "PenTool", label: "Graphics Designing", slug: "graphics-designing" },
  { icon: "Layout", label: "UI/UX Design", slug: "ui-ux-design" },
  { icon: "ShoppingCart", label: "E-commerce", slug: "e-commerce" },
  { icon: "CreditCard", label: "POS Solutions", slug: "pos-business" },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden text-white text-center">
        <Image
          src="/about/about1.jpg"
          alt="About Header"
          fill
          className="object-cover object-center brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/70 to-indigo-400/70 z-0"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            The Key to Smart IT Solutions
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
            IT Solution Provider for Your Business
          </p>
          <GetInTouchButton
            homePath="/"
            contactId="start-project"
            className="mt-6 inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-full shadow hover:scale-105 hover:shadow-lg transition-transform"
          />
        </div>
      </section>

      {/* Scroll logic */}
      <ClientScroll sectionId="contact" />

      {/* Overview Section */}
      <section className="container mx-auto py-24 px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
          <div>
            <span className="text-blue-600 font-semibold uppercase tracking-wide text-sm">Who We Are</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-gray-900">Overview</h2>
            <p className="mb-5 text-lg leading-relaxed text-gray-700">
              ATX Technologies is a leading software company delivering{" "}
              <span className="font-semibold text-gray-900">innovative web, mobile, and cloud solutions</span>.
              We partner with global clients to design cutting-edge digital products tailored to their business goals.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Backed by a strong team and deep technical expertise, we transform ideas into impactful digital experiences that scale and drive measurable success.
            </p>
          </div>
          <div className="relative w-full h-70 md:h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-100 rounded-2xl" />
            <Image src="/logo.png" alt="ATX Overview" fill className="object-contain drop-shadow-2xl relative z-10" />
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="bg-gray-50 py-20 px-8 md:px-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Offices: One Team, One Vision!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div className="w-full h-72 relative rounded-xl overflow-hidden shadow-lg">
              <Image src="/bhopal.jpg" alt="Bhopal Office" fill className="object-cover hover:scale-105 transition-transform" />
            </div>
            <div>
              <h5 className="font-bold text-xl mb-3 text-blue-700">🏢 Bhopal Office</h5>
              <p className="font-semibold mb-2">Baghmughaliya, Bhopal (MP)</p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our Bhopal office serves as the heart of our operations in India. Located in Baghmughaliya, it reflects our vision to create a collaborative, growth-driven environment where innovation meets dedication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-8 md:px-16">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Our Core Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
            {Service.map((service) => {
              const ServiceIcon = LucideIcons[service.icon] as React.FC<{ className?: string }>;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                  <ServiceIcon className="mx-auto mb-3 h-12 w-12 text-blue-600 transition-colors hover:text-indigo-700" />
                  <p className="font-semibold text-gray-700">{service.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-100 py-20 px-6 sm:px-10 md:px-16">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              { img: "/abhaysir2.png", name: "Abhay Singh", role: "IT Architect Head", bio: "Expert in cloud solutions and scalable infrastructures." },
              { img: "/sankalp.jpg", name: "Sankalp Shinde", role: "App Developer", bio: "Specialist in cross-platform app development." },
              { img: "/anant office.jpg", name: "Anant Sharma", role: "Fulstack developer", bio: "Expert in mobile and app building solutions" },
              { img: "/jaydeep.jpg", name: "Jaydeep Sharma", role: "Design Lead", bio: "Creative leader shaping engaging user experiences." },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-xl shadow-md hover:shadow-xl text-center p-6 transition-transform hover:scale-105 space-y-2">
                <div className="w-32 h-32 mx-auto relative mb-4 rounded-full overflow-hidden shadow">
                  <Image src={member.img} alt={member.name} fill className="object-cover hover:scale-110 transition-transform" />
                </div>
                <h5 className="font-semibold text-gray-900">{member.name}</h5>
                <small className="text-blue-600 font-medium">{member.role}</small>
                <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="bg-white py-20 px-8 md:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Our Clients & Achievements</h2>
          <div className="flex flex-wrap justify-center items-center gap-10">
            <div className="flex flex-col items-center">
              <Image src="/nayuku.png" alt="Nayku Logo" width={120} height={60} />
              <p className="mt-3 text-gray-700 text-sm">Trusted by Nayku</p>
            </div>
          </div>
          <p className="mt-8 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            We are proud to have partnered with industry leaders like <strong>Nayku</strong>, delivering scalable solutions and measurable results.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-8 md:px-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <p className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700">
            Atx Technologies India Limited is a growing software development company offering a wide range of services including web development, app development, UI/UX design, graphic design, e-commerce solutions, and more. Our passionate team is committed to delivering tailored digital solutions that help businesses thrive in a competitive landscape.
          </p>
          <p className="mt-8 text-lg flex items-center justify-center gap-3">
            <span>📧</span>
            <a href="mailto:info@atxtechnologies.in" className="text-blue-600 hover:underline">
              info@atxtechnologies.in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
