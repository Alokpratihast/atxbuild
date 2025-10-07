"use client";

import { useFormContext, useFieldArray, FieldError } from "react-hook-form";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";

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
    <section className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl max-w-3xl mx-auto space-y-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900">Skills</h2>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border rounded-xl p-4 bg-white shadow hover:shadow-md transition"
          >
            {/* Skill Name */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium">Skill Name</label>
              <input
                type="text"
                {...register(`skills.${index}.name` as const, {
                  required: "Skill Name is required",
                })}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                  getSkillError(index, "name") ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
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
                className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                  getSkillError(index, "rating") ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
                placeholder="5"
              />
              <p className="text-red-500 text-sm">{getSkillError(index, "rating")}</p>
            </div>

            {/* Remove Button */}
             <div className="md:col-span-1 flex justify-center items-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-md"
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Button */}
      <div className="flex justify-center md:justify-end">
        <button
          type="button"
          onClick={() => append({ name: "", rating: 1 })}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
        >
          <AiOutlinePlus size={18} />
          Add Skill
        </button>
      </div>
    </section>
  );
}
