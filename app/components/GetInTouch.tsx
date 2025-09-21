"use client";

import { MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/solid";

export default function GetInTouch() {
  return (
    <section className="py-10" id="contact">
      <div className="container mx-auto px-2 space-y-6">
        
        {/* adress section */}
        <div className="bg-gray-900 text-white rounded-lg p-6">
          <h5 className="font-bold text-lg mb-4">Get in Touch</h5>
          
          <p className="flex items-start mb-3">
            <MapPinIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            Baghmughaliya, Bhopal, MP
          </p>
          
          <p className="flex items-start mb-1">
            <EnvelopeIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            info@atxtechnologies.in
          </p>
          <small className="text-gray-400 block ml-7">
            We will respond within 24 hours
          </small>

          <hr className="border-gray-700 my-4" />
        </div>

        {/* Google Map Embed */}
        <div className="rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps?q=Baghmugaliya,+Bhopal,+MP&output=embed"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
