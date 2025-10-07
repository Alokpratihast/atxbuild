"use client";

import { useFormContext, FieldError, FieldErrors, Merge } from "react-hook-form";

/**
 * Helper function to safely get the error message from react-hook-form's errors object.
 */
const getErrorMessage = (error?: FieldError | Merge<FieldError, FieldErrors<any>> | string) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message?.toString() || "";
};

/**
 * Step1BasicInfo Component
 */
export default function Step1BasicInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Calculate max DOB allowed (today minus 18 years)
  const today = new Date();
  const maxDob = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0]; // YYYY-MM-DD

  return (
    <section className="p-8 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl max-w-2xl mx-auto space-y-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <InputField
          label="First Name"
          placeholder="Enter your first name"
          error={getErrorMessage(errors.firstName)}
          registerProps={register("firstName", { required: "First Name is required" })}
        />

        {/* Last Name */}
        <InputField
          label="Last Name"
          placeholder="Enter your last name"
          error={getErrorMessage(errors.lastName)}
          registerProps={register("lastName", { required: "Last Name is required" })}
        />

        {/* Location */}
        <InputField
          label="Location"
          placeholder="Enter your city, country"
          error={getErrorMessage(errors.location)}
          registerProps={register("location", { required: "Location is required" })}
        />

        {/* Contact Number */}
        <InputField
          label="Contact Number"
          type="tel"
          inputMode="numeric"
          placeholder="Enter your contact number"
          error={getErrorMessage(errors.contactNumber)}
          registerProps={register("contactNumber", {
            required: "Contact Number is required",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Contact Number must be exactly 10 digits",
            },
          })}
        />

        {/* Email */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          error={getErrorMessage(errors.email)}
          registerProps={register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
              message: "Email must be a valid @gmail.com address",
            },
          })}
        />

        {/* Password */}
        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={getErrorMessage(errors.password)}
          registerProps={register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
        />

        {/* Date of Birth */}
        <InputField
          label="Date of Birth"
          type="date"
          placeholder="Select your date of birth"
          error={getErrorMessage(errors.dob)}
          registerProps={register("dob", {
            required: "Date of Birth is required",
            validate: (value) => {
              if (!value) return "Date of Birth is required";

              const dob = new Date(value);
              let age = today.getFullYear() - dob.getFullYear();
              const monthDiff = today.getMonth() - dob.getMonth();
              const dayDiff = today.getDate() - dob.getDate();

              if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
              }

              return age >= 18 || "You must be at least 18 years old";
            },
          })}
          max={maxDob} // Only allow DOB 18+ years ago
        />
      </div>
    </section>
  );
}

/**
 * InputField Component
 */
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  registerProps: any;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  max?: string; // For date max
}

const InputField = ({ label, type = "text", placeholder, error, registerProps, max }: InputFieldProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      {...registerProps}
      placeholder={placeholder}
      max={max}
      className={`w-full px-4 py-2 rounded-lg border ${error ? "border-red-500" : "border-gray-300"
        } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);
