"use client";

import { useState, useEffect } from "react";
import { Calendar, Mail, Phone, Briefcase } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod schema for validation
const contactSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(
      /^[+]?[\d]{10,15}$/,
      "Phone number must contain only digits and optionally start with +"
    ),

  service: z.string().min(1, "Select a service"),
  projectDescription: z.string().min(1, "Project description is required"),
  updates: z.boolean(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ProjectContactForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      projectDescription: "",
      updates: false,
    },
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("projectContactForm", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Restore saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("projectContactForm");
    if (savedData) reset(JSON.parse(savedData));
  }, [reset]);

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    if (loading) return;

    setLoading(true);
    try {
      console.log("📨 Sending form data:", data);

      const res = await fetch("/api/auth/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const result = await res.json();

      if (result.success) {
        reset();
        localStorage.removeItem("projectContactForm");
        window.scrollTo({ top: 0, behavior: "smooth" });
        alert("✅ Email sent successfully!");
      } else {
        alert("⚠️ Failed to send email. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 py-16 px-4" id="start-project">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Let’s Start Your Project
        </h2>
        <p className="mt-3 text-gray-600">
          Ready to innovate? Get in touch for a free consultation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-6"
      >
        {/* First and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              {...register("firstName")}
              type="text"
              placeholder="First Name *"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register("lastName")}
              type="text"
              placeholder="Last Name *"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            {...register("email")}
            type="email"
            placeholder="Email Address *"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="relative">
          <input
            {...register("phone")}
            type="tel"
            placeholder="Phone Number *"
            maxLength={15}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/[^0-9+]/g, ""); // only allow digits and '+'
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Service */}
        <div className="relative">
          <select
            {...register("service")}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a service *</option>
            <option>Web Development</option>
            <option>App Development</option>
            <option>UI/UX Design</option>
            <option>Cloud Infrastructure</option>
          </select>
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {errors.service && (
            <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>
          )}
        </div>

        {/* Project Description */}
        <div className="relative">
          <textarea
            {...register("projectDescription")}
            placeholder="Project Description *"
            rows={4}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {errors.projectDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message}</p>
          )}
        </div>

        {/* Updates Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            {...register("updates")}
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label className="text-gray-700">
            Receive updates about ATX Technologies
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Submit"}
        </button>
      </form>
    </section>
  );
}
