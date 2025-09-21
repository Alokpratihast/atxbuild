"use client";

import { useFormContext, useFieldArray, FieldError } from "react-hook-form";

// Type for a single skill
interface Skill {
  name: string;
  rating: number;
}

export default function Step3Skills() {
  const { control, register, formState: { errors } } = useFormContext();

  // Using useFieldArray for dynamic skills
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  // --- Type-safe error helper ---
  const skillErrors = errors.skills as
    | { name?: FieldError; rating?: FieldError }[]
    | undefined;

  const getSkillError = (index: number, field: keyof Skill) => {
    if (!skillErrors) return "";
    return skillErrors[index]?.[field]?.message || "";
  };

  return (
    <section className="p-6 bg-white shadow-md rounded-xl max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Skills</h2>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border rounded-lg p-4 bg-gray-50"
          >
            {/* Skill Name */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium">Skill Name</label>
              <input
                type="text"
                {...register(`skills.${index}.name` as const, {
                  required: "Skill Name is required",
                })}
                className={`mt-1 block w-full rounded-md border ${
                  getSkillError(index, "name") ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                placeholder="e.g., React, Node.js, Python"
              />
              <p className="text-red-500 text-sm">{getSkillError(index, "name")}</p>
            </div>

            {/* Skill Rating */}
            <div>
              <label className="block text-gray-700 font-medium">Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                {...register(`skills.${index}.rating` as const, {
                  required: "Rating is required",
                })}
                className={`mt-1 block w-full rounded-md border ${
                  getSkillError(index, "rating") ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                placeholder="5"
              />
              <p className="text-red-500 text-sm">{getSkillError(index, "rating")}</p>
            </div>

            {/* Remove Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1} // Prevent removing last skill
                className={`px-3 py-2 rounded-md text-white ${
                  fields.length === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => append({ name: "", rating: 1 })}
          className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
        >
          + Add Skill
        </button>
      </div>
    </section>
  );
}
