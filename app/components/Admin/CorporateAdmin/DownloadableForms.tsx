'use client';
import { useState } from "react";
import { toast } from "react-hot-toast";

interface FormDoc {
  _id?: string;
  title: string;
  fileUrl: string;
}

export default function DownloadableForms() {
  const [forms, setForms] = useState<FormDoc[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!title || !file) {
      toast.error("Please provide form title and upload a file");
      return;
    }
    const fakeUrl = URL.createObjectURL(file);
    setForms(prev => [...prev, { title, fileUrl: fakeUrl }]);
    setTitle("");
    setFile(null);
    toast.success("Form uploaded");
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Downloadable Forms & Documents</h2>

      <input
        type="text"
        placeholder="Form Title"
        className="w-full border px-3 py-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Upload Form
      </button>

      <ul className="mt-4 space-y-2">
        {forms.map((f, idx) => (
          <li key={idx} className="border p-2 rounded flex justify-between items-center">
            <span>{f.title}</span>
            <a
              href={f.fileUrl}
              download
              className="text-blue-600 hover:underline"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
