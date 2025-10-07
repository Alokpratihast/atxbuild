"use client";

import { useFormContext, FieldError, FieldErrors, Merge } from "react-hook-form";

/**
 * Helper to safely extract error message from react-hook-form errors.
 */
const getErrorMessage = (error?: FieldError | Merge<FieldError, FieldErrors<any>> | string) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message?.toString() || "";
};

/**
 * Step2Professional Component
 * Collects professional details: current profile, experience, CTC, work preference, notice period.
 */
export default function Step2Professional() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="p-8 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl max-w-2xl mx-auto space-y-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
        Professional Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Current Profile"
          placeholder="Enter your current job title"
          error={getErrorMessage(errors.currentProfile)}
          registerProps={register("currentProfile", { required: "Current Profile is required" })}
        />

        <InputField
          label="Total Experience (Years)"
          type="number"
          min={0}
          placeholder="Enter total years of experience"
          error={getErrorMessage(errors.totalExperience)}
          registerProps={register("totalExperience", { required: "Total Experience is required" })}
        />

        <InputField
          label="Relevant Experience (Years)"
          type="number"
          min={0}
          placeholder="Enter relevant years of experience"
          error={getErrorMessage(errors.relevantExperience)}
          registerProps={register("relevantExperience", { required: "Relevant Experience is required" })}
        />

        <InputField
          label="Current CTC (in ₹)"
          type="number"
          min={0}
          placeholder="Enter your current salary (in ₹)"
          error={getErrorMessage(errors.currentCTC)}
          registerProps={register("currentCTC", { required: "Current CTC is required" })}
        />

        <InputField
          label="Expected CTC (in ₹)"
          type="number"
          min={0}
          placeholder="Enter your expected salary (in ₹)"
          error={getErrorMessage(errors.expectedCTC)}
          registerProps={register("expectedCTC", { required: "Expected CTC is required" })}
        />

        <SelectField
          label="Work Preference"
          error={getErrorMessage(errors.workPreference)}
          registerProps={register("workPreference", { required: "Work Preference is required" })}
          options={["Remote", "Onsite", "Hybrid"]}
          placeholder="Select your work preference"
        />

        <InputField
          label="Notice Period (days)"
          type="number"
          min={0}
          placeholder="Enter your notice period in days"
          error={getErrorMessage(errors.noticePeriod)}
          registerProps={register("noticePeriod", { required: "Notice Period is required" })}
        />
      </div>
    </section>
  );
}

/**
 * Reusable InputField Component
 */
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  min?: number;
  registerProps: any;
}

const InputField = ({ label, type = "text", placeholder, error, min, registerProps }: InputFieldProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      min={min}
      {...registerProps}
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg border ${
        error ? "border-red-500" : "border-gray-300"
      } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

/**
 * Reusable SelectField Component
 */
interface SelectFieldProps {
  label: string;
  placeholder?: string;
  error?: string;
  registerProps: any;
  options: string[];
}

const SelectField = ({ label, placeholder, error, registerProps, options }: SelectFieldProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      {...registerProps}
      className={`w-full px-4 py-2 rounded-lg border ${
        error ? "border-red-500" : "border-gray-300"
      } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);
