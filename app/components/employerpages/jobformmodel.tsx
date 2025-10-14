"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export interface Job {
  _id?: string;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  totalExperience?: number;
  skills: string[];
  availability: string;
  deadline?: Date | string;
  company: string;
  isActive: boolean;
  status?: "pending" | "approved" | "rejected";
  createdBy?: string;
}

interface JobFormModalProps {
  editingJob?: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JobFormModal({ editingJob, onClose, onSuccess }: JobFormModalProps) {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    totalExperience: "",
    skills: "",
    availability: "Flexible",
    deadline: "",
    company: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // provider verification state

  // Populate form for editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || "",
        description: editingJob.description || "",
        location: editingJob.location || "",
        salaryMin: editingJob.salaryMin?.toString() || "",
        salaryMax: editingJob.salaryMax?.toString() || "",
        totalExperience: editingJob.totalExperience?.toString() || "",
        skills: editingJob.skills?.join(", ") || "",
        availability: editingJob.availability || "Flexible",
        deadline: editingJob.deadline
          ? new Date(editingJob.deadline).toISOString().split("T")[0]
          : "",
        company: editingJob.company || "",
        isActive: editingJob.isActive ?? true,
      });
    }
  }, [editingJob]);

  // Fetch provider verification status
  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch("/api/employeeregister/providerstatus", { credentials: "include" });
        const data = await res.json();
        setIsVerified(res.ok && data.verified);
      } catch (err) {
        console.error("Verification check failed:", err);
        setIsVerified(false);
      }
    };
    fetchVerification();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target.type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in to create or edit jobs.");
      return;
    }

    if (isVerified === false) {
      toast.error("Your account is not verified by admin. Cannot submit jobs.");
      return;
    }

    const salaryMin = Number(formData.salaryMin);
    const salaryMax = Number(formData.salaryMax);
    const totalExp = Number(formData.totalExperience);
    const skillsArray = formData.skills
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      toast.error("Minimum salary cannot exceed maximum salary.");
      return;
    }
    if (totalExp && totalExp < 0) {
      toast.error("Total experience cannot be negative.");
      return;
    }
    if (skillsArray.length === 0) {
      toast.error("Please provide at least one skill.");
      return;
    }

    setLoading(true);

    try {
      const method = editingJob ? "PUT" : "POST";

      const apiRoute = editingJob
        ? `/api/employeeregister/employerjobs/${editingJob._id}`
        : "/api/employeeregister/employerjobs";

      const payload: Job = {
        ...formData,
        salaryMin: salaryMin || undefined,
        salaryMax: salaryMax || undefined,
        totalExperience: totalExp || undefined,
        skills: skillsArray,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        createdBy: session.user.id,
        availability: formData.availability || "Flexible",
        isActive: Boolean(formData.isActive),
      };

      const res = await fetch(apiRoute, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Job ${editingJob ? "updated" : "created"} successfully!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to save job");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">{editingJob ? "Edit Job" : "Add Job"}</h2>

        {isVerified === false && (
          <p className="text-red-500 mb-2">
            Your provider account is not yet approved by admin. You cannot submit jobs.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" className="w-full border rounded p-2" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Job Description" className="w-full border rounded p-2" required />
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full border rounded p-2" required />
          <input name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" className="w-full border rounded p-2" required />

          <div className="flex gap-2">
            <input name="salaryMin" type="number" value={formData.salaryMin} onChange={handleChange} placeholder="Min Salary" className="w-1/2 border rounded p-2" />
            <input name="salaryMax" type="number" value={formData.salaryMax} onChange={handleChange} placeholder="Max Salary" className="w-1/2 border rounded p-2" />
          </div>

          <input name="totalExperience" type="number" value={formData.totalExperience} onChange={handleChange} placeholder="Total Experience (years)" className="w-full border rounded p-2" />
          <input name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full border rounded p-2" />
          <input name="availability" value={formData.availability} onChange={handleChange} placeholder="Availability" className="w-full border rounded p-2" />
          <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className="w-full border rounded p-2" required />

          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button
              type="submit"
              disabled={loading || isVerified === false}
              className={`px-4 py-2 rounded text-white ${
                loading || isVerified === false ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : editingJob ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
