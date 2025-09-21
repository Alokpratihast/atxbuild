"use client";

import { useFormContext } from "react-hook-form";
import { Paperclip, UploadCloud, X } from "lucide-react";

type FileWithProgress = {
  file: File;
  progress: number;
  uploadedUrl?: string;
};

export default function Step5Files() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const resumeFiles = watch("resume") as FileWithProgress[] | undefined;
  const coverFiles = watch("coverLetter") as FileWithProgress[] | undefined;

  register("resume", {
    validate: (files: FileWithProgress[]) =>
      files && files.length > 0 && files[0].uploadedUrl ? true : "Please upload your resume",
  });

  const uploadFileToServer = async (file: File, index: number, field: "resume" | "coverLetter") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploadresume", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        const updatedFiles = watch(field)?.map((f: FileWithProgress, idx: number) =>
          idx === index ? { ...f, uploadedUrl: data.url, progress: 100 } : f
        );
        setValue(field, updatedFiles, { shouldValidate: true, shouldDirty: true });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "resume" | "coverLetter") => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const filesWithProgress: FileWithProgress[] = selectedFiles.map((file: File) => ({
      file,
      progress: 0,
    }));

    setValue(field, filesWithProgress, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

    filesWithProgress.forEach((f: FileWithProgress, idx: number) => uploadFileToServer(f.file, idx, field));
  };

  const handleRemoveFile = (field: "resume" | "coverLetter", index?: number) => {
    const current = watch(field) as FileWithProgress[] | undefined;
    if (!current || current.length === 0) return;
    const updated = index !== undefined ? current.filter((_: FileWithProgress, i: number) => i !== index) : [];
    setValue(field, updated, { shouldValidate: true, shouldDirty: true });
  };

  const UploadBox = ({
    field,
    label,
    files,
    required,
  }: {
    field: "resume" | "coverLetter";
    label: string;
    files?: FileWithProgress[];
    required?: boolean;
  }) => (
    <div className="flex flex-col space-y-2">
      <label className="flex items-center space-x-2 text-gray-700 font-medium">
        <Paperclip size={20} />
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
        {files && files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((f: FileWithProgress, idx: number) => (
              <li key={idx} className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <span className="text-green-600 break-words">{f.file.name}</span>
                  {f.progress < 100 && <span className="text-sm text-gray-500">{f.progress}% uploading</span>}
                  {f.uploadedUrl && (
                    <a href={f.uploadedUrl} target="_blank" className="text-blue-600 text-sm underline">
                      View uploaded
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(field, idx)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X size={16} />
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
          onChange={(e) => handleFileChange(e, field)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          multiple
        />
      </div>

      {errors[field] && (
        <p className="text-red-500 text-sm">{errors[field]?.message as string}</p>
      )}
    </div>
  );

  return (
    <section className="p-6 bg-white shadow-lg rounded-xl max-w-lg mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Upload Files</h2>

      <UploadBox field="resume" label="Resume (PDF/DOC/DOCX)" files={resumeFiles} required />
      <UploadBox field="coverLetter" label="Cover Letter (Optional)" files={coverFiles} />
    </section>
  );
}
