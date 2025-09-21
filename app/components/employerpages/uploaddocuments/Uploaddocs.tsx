"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Document {
  name: string;
  url: string;
  uploadedAt: string;
}

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "employer") router.push("/");
  }, [status, session, router]);

  // Fetch uploaded documents
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/employer/${session.user.id}/documents`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setDocuments(data.documents.reverse()); // recent first
        });
    }
  }, [session]);

  if (status === "loading") return <p className="text-center mt-10">Loading...</p>;
  if (!session || session.user.role !== "employer") return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return toast.error("Please select files!");
    setUploading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("employerId", session.user.id);

    try {
      const res = await fetch("/api/employeeregister/upload-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Documents uploaded successfully ✅");
        setSelectedFiles([]);
        setDocuments(data.employer.documents.reverse());
      } else {
        toast.error("Upload failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (url: string) => {
    if (!session?.user) return;
    const confirmDelete = confirm("Are you sure you want to remove this document?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/employeeregister/delete-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId: session.user.id, documentUrl: url }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Document removed ✅");
        setDocuments(data.employer.documents.reverse());
      } else {
        toast.error("Failed to remove document ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Upload Section */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-center">Upload Documents</h1>
          <p className="text-gray-600 mb-4 text-center">
            Upload multiple employee-related documents (Certificates, IDs, Experience Letters)
          </p>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } transition`}
          >
            {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length}) files` : ""}`}
          </button>

          {selectedFiles.length > 0 && (
            <ul className="mt-4 text-sm text-gray-700">
              {selectedFiles.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Uploaded Documents */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center">Uploaded Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-600 text-center flex-1">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto flex-1">
              {documents.map((doc) => (
                <li
                  key={doc.url}
                  className="flex justify-between items-center p-2 border-b border-gray-200 rounded hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {doc.name}
                    </a>
                    <span className="text-sm text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(doc.url)}
                    className="text-red-600 hover:text-red-800 font-semibold ml-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Stats / Summary */}
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
          <p className="text-gray-500">Total Documents</p>
          <p className="text-3xl font-bold">{documents.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
          <p className="text-gray-500">Last Upload</p>
          <p className="text-xl font-semibold">
            {documents[0] ? new Date(documents[0].uploadedAt).toLocaleDateString() : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
