"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useSession } from "next-auth/react";

interface ApplyModalProps {
  job: any;
  onClose: () => void;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function ApplyModal({ job, onClose }: ApplyModalProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // ---------- FETCH USER PROFILE ----------
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/jobseekerprofile?user-id=${session.user.id}`);
        const data = await res.json();
        if (data.success && data.jobSeeker) {
          const js = data.jobSeeker;
          setFormData({
            name: `${js.firstName} ${js.lastName}`,
            email: js.email,
            contactNumber: js.contactNumber || "",
            coverLetter: js.coverLetter || "",
          });
        }
      } catch (err) {
        console.error(err);
        addToast("Failed to load profile data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  // ---------- ESC KEY & FOCUS TRAP ----------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'input, textarea, button'
        );
        if (focusable.length === 0) return;

        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ---------- TOAST FUNCTION ----------
  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ---------- INPUT HANDLERS ----------
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowed = ["application/pdf", 
                       "application/msword", 
                       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowed.includes(file.type)) {
        addToast("Resume must be PDF or Word document.", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        addToast("Resume file must be less than 2MB.", "error");
        return;
      }
      setResumeFile(file);
    }
  };

  // ---------- SUBMIT APPLICATION ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      addToast("You must be logged in to apply.", "error");
      return;
    }

    if (!formData.name || !formData.email || !resumeFile) {
      addToast("Please fill in all required fields (Name, Email, Resume).", "error");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("jobId", job._id || job.id);
      data.append("userId", session.user.id);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("contactNumber", formData.contactNumber);
      data.append("coverLetter", formData.coverLetter);
      data.append("title", job.title || "N/A");
      data.append("company", job.company || "N/A");
      data.append("resume", resumeFile);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        addToast("Application submitted successfully!", "success");

        // Reset form
        setResumeFile(null);
        setFormData({ name: "", email: "", contactNumber: "", coverLetter: "" });

        setTimeout(onClose, 2000);
      } else {
        addToast(result.error || "Failed to submit application.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-job-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md relative shadow-lg"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 id="apply-job-title" className="text-2xl font-bold mb-4">
          Apply for {job.title || "this job"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {resumeFile && <p className="text-sm text-gray-600 dark:text-gray-300">Selected: {resumeFile.name}</p>}
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            placeholder="Cover Letter (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition ${
              submitting ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {/* ---------- TOASTS ---------- */}
        <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-2 rounded shadow-lg text-white transition transform ${
                toast.type === "success"
                  ? "bg-green-500 animate-slide-up"
                  : "bg-red-500 animate-slide-up"
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
