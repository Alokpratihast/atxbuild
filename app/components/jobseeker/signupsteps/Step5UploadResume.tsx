"use client";

import { useFormContext } from "react-hook-form";
import { Paperclip, UploadCloud, X, Loader2 } from "lucide-react";
import { FormValues, FileWithProgress } from "@components/jobseeker/JobSeekerSignupForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export default function Step5Files() {
  const {
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useFormContext<FormValues>();

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Upload function
  const uploadFileToServer = (fileObj: FileWithProgress, field: "resume" | "coverLetter") => {
    if (fileObj.uploadedUrl) return;

    const formData = new FormData();
    formData.append("file", fileObj.file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploadresume");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setValue(
          field,
          (watch(field) || []).map((f) =>
            f.id === fileObj.id ? { ...f, progress } : f
          ),
          { shouldValidate: true, shouldDirty: true }
        );
      }
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 200 && data.url) {
        setValue(
          field,
          (watch(field) || []).map((f) =>
            f.id === fileObj.id
              ? { ...f, uploadedUrl: data.url, progress: 100 }
              : f
          ),
          { shouldValidate: true, shouldDirty: true }
        );
        clearErrors(field);
      } else {
        setValue(
          field,
          (watch(field) || []).map((f) =>
            f.id === fileObj.id
              ? { ...f, error: data.error || "Upload failed" }
              : f
          ),
          { shouldValidate: true, shouldDirty: true }
        );
        setError(field, { type: "manual", message: data.error || "Upload failed" });
      }
    };

    xhr.onerror = () => {
      setValue(
        field,
        (watch(field) || []).map((f) =>
          f.id === fileObj.id ? { ...f, error: "Upload error" } : f
        ),
        { shouldValidate: true, shouldDirty: true }
      );
      setError(field, { type: "manual", message: "Upload error" });
    };

    xhr.send(formData);
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "resume" | "coverLetter") => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];

    const invalidFiles = selectedFiles.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return !ext || !ALLOWED_EXTENSIONS.includes(ext) || f.size > MAX_FILE_SIZE;
    });

    if (invalidFiles.length > 0) {
      alert("Invalid file type or size. Only PDF/DOC/DOCX under 5MB allowed.");
      return;
    }

    const filesWithProgress: FileWithProgress[] = selectedFiles.map((f) => ({
      id: generateId(),
      file: f,
      progress: 0,
    }));

    const updatedFiles =
      field === "resume"
        ? [filesWithProgress[0]]
        : [...(watch(field) || []), ...filesWithProgress];

    setValue(field, updatedFiles, { shouldValidate: true, shouldDirty: true });
    filesWithProgress.forEach((f) => uploadFileToServer(f, field));
  };

  // Remove file
  const handleRemoveFile = (field: "resume" | "coverLetter", id: string) => {
    const updated = (watch(field) || []).filter((f: any) => f.id !== id);
    setValue(field, updated, { shouldValidate: true, shouldDirty: true });

    if (field === "resume" && updated.length === 0) {
      setError(field, { type: "manual", message: "Please upload your resume" });
    }
  };

  return (
    <section className="p-6 bg-white shadow-lg rounded-xl max-w-lg mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Upload Files</h2>

      {["resume", "coverLetter"].map((field) => {
        const files = watch(field as "resume" | "coverLetter") as FileWithProgress[] | undefined;
        const label = field === "resume" ? "Resume (required)" : "Cover Letter (optional)";

        return (
          <div key={field} className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 text-gray-700 font-medium">
              <Paperclip size={20} />
              <span>{label}</span>
            </label>

            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
              {files && files.length > 0 ? (
                <ul className="space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
                    >
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-center gap-2">
                          {f.progress < 100 && !f.error && (
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          )}
                          <span className="text-gray-800 font-medium break-words">
                            {f.file?.name || "Unnamed File"}
                          </span>
                        </div>

                        {/* Progress bar */}
                        {f.progress < 100 && !f.error && (
                          <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${f.progress}%` }}
                            ></div>
                          </div>
                        )}

                        {/* Uploaded link */}
                        {f.uploadedUrl && (
                          <a
                            href={f.uploadedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 text-sm underline mt-1"
                          >
                            View uploaded
                          </a>
                        )}

                        {/* Error */}
                        {f.error && <span className="text-red-500 text-sm mt-1">{f.error}</span>}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(field as "resume" | "coverLetter", f.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition flex items-center gap-1 ml-2"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <UploadCloud size={24} className="mx-auto text-indigo-500 mb-2" />
                  <p className="text-gray-600">Click or drag your file here</p>
                </>
              )}

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, field as "resume" | "coverLetter")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                multiple={field === "coverLetter"}
              />
            </div>

            {errors[field as "resume" | "coverLetter"] && (
              <p className="text-red-500 text-sm">{errors[field as "resume" | "coverLetter"]?.message}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
