

import Image from "next/image";
import { notFound } from "next/navigation";
import { servicesData } from "@/models/servicesData";
import GetInTouchButton from "@/components/Aboutgettouch";
import { getSeoMetadata } from "@/lib/getSeoMetadata";
import { Metadata } from "next";

interface ServicePageProps {
  params: { slug: string };
}

// ✅ Dynamic SEO for each service
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const slug = params.slug.toLowerCase();

  // Ignore static assets
  if (slug === "favicon.ico" || slug.endsWith(".png") || slug.endsWith(".jpg") || slug === "robots.txt") {
    return {
      title: "ATX Technologies",
      description: "Default description",
    };
  }

  const seo = await getSeoMetadata(slug);
  if (!seo) {
    return {
      title: "Service Not Found",
      description: "The requested service page does not exist.",
    };
  }

  return seo;
}

// ✅ Dynamic Service Page component
export default function ServicePage({ params }: ServicePageProps) {
  const slug = params.slug.toLowerCase();
  const service = servicesData[slug as keyof typeof servicesData];

  if (!service) return notFound();

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center text-center">
        {service.bannerimg && (
          <div className="absolute inset-0">
            <Image src={service.bannerimg} alt={service.title} fill className="object-cover brightness-75" priority />
          </div>
        )}
        <div className="relative z-10 px-6 max-w-5xl mx-auto text-white">
          <h1 className="font-extrabold text-4xl md:text-6xl mb-4 drop-shadow-lg">{service.title}</h1>
          {service.subtitle && <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 drop-shadow">{service.subtitle}</p>}
          <GetInTouchButton label="Talk to Our Experts" homePath="/" contactId="start-project" className="inline-block px-8 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition" />
        </div>
      </section>

      {/* Overview Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          {service.heading && <h2 className="font-bold text-3xl md:text-4xl mb-6 text-gray-900">{service.heading}</h2>}
          <p className="text-gray-700 leading-relaxed text-lg">{service.description}</p>
        </div>
        {service.image && (
          <div className="relative w-full h-80 md:h-[420px] rounded-xl overflow-hidden shadow-lg">
            <Image src={service.image} alt={service.title} fill className="object-cover" priority />
          </div>
        )}
      </section>

      {/* Industry Reach */}
      {Array.isArray(service.industries) && service.industries.length > 0 && (
        <section className="py-20 bg-white text-center">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-bold text-3xl md:text-4xl mb-12 text-gray-900">Our Diverse Industry Reach</h2>
            <div className="grid gap-6 justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {service.industries.map((industry, idx) => {
                const IconComponent = industry.icon;
                return (
                  <div key={idx} aria-label={industry.name} className="flex flex-col items-center p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 cursor-pointer">
                    {IconComponent && (
                      <div className="p-5 rounded-full bg-blue-100 text-blue-600 mb-3 flex items-center justify-center">
                        <IconComponent size={40} />
                      </div>
                    )}
                    <p className="font-semibold text-gray-800 text-sm sm:text-base text-center break-words">{industry.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features / Benefits */}
      {Array.isArray(service.features) && service.features.length > 0 && (
        <section className="py-20 text-center bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-bold text-3xl md:text-4xl mb-12 text-gray-900">Why Choose Us for {service.title}</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {service.features.map((feat, idx) => (
                <div key={idx} className="border border-gray-200 bg-white p-6 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-200 transition">
                  <h5 className="font-semibold text-lg mb-3 text-gray-800">{feat.title}</h5>
                  <p className="text-gray-600 text-base">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 text-white text-center bg-gradient-to-r from-blue-500 to-blue-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-bold text-3xl md:text-4xl mb-6">Let’s Code Your Business Vision</h2>
          <GetInTouchButton label="Lets Get Started" homePath="/" contactId="start-project" className="px-10 py-4 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 transition text-lg" />
        </div>
      </section>
    </main>
  );
}
