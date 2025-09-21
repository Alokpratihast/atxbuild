"use client";

import { useFormContext, useFieldArray, FieldError } from "react-hook-form";

// Type for a single experience entry
interface Experience {
  company: string;
  role: string;
  duration: number;
}

export default function Step4Experience() {
  const { control, register, formState: { errors } } = useFormContext();

  // Field array for dynamic experience entries
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  // --- Type-safe errors ---
  const experienceErrors = errors.experience as
    | { company?: FieldError; role?: FieldError; duration?: FieldError }[]
    | undefined;

  const getError = (index: number, field: keyof Experience) => {
    return experienceErrors?.[index]?.[field]?.message || "";
  };

  return (
    <section className="p-6 bg-white shadow-lg rounded-2xl max-w-3xl mx-auto space-y-6 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
        🧑‍💼 Work Experience
      </h2>
      <p className="text-gray-500 text-sm">
        Add details of your past work experience. You can add multiple entries.
      </p>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 relative"
        >
          {/* Company */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              {...register(`experience.${index}.company` as const, {
                required: "Company is required",
              })}
              placeholder="e.g. ABC Corp"
              className={`mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                getError(index, "company") ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs mt-1">{getError(index, "company")}</p>
          </div>

          {/* Role */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              {...register(`experience.${index}.role` as const, {
                required: "Role is required",
              })}
              placeholder="e.g. Software Engineer"
              className={`mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                getError(index, "role") ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs mt-1">{getError(index, "role")}</p>
          </div>

          {/* Duration */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Duration (Months)</label>
            <input
              type="number"
              min={0}
              {...register(`experience.${index}.duration` as const, {
                required: "Duration is required",
              })}
              placeholder="e.g. 24"
              className={`mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                getError(index, "duration") ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs mt-1">{getError(index, "duration")}</p>
          </div>

          {/* Remove Button */}
          <div className="md:col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Add Experience Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => append({ company: "", role: "", duration: 0 })}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all"
        >
          + Add Experience
        </button>
      </div>
    </section>
  );
}
