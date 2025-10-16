"use client";
import BlogFormModal from "@/components/Admin/adminblog/AdminBlogsDashboard";
import { useRouter } from "next/navigation";

export default function NewBlogPage() {
  const router = useRouter();

  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Blog</h1>
      <BlogFormModal  />
    </div>
  );
}
