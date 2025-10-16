"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CreatableSelect from "react-select/creatable";
import { SingleValue, MultiValue } from "react-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/Admin/adminblog/ui/Input";
import { Label } from "@/components/Admin/adminblog/ui/Label";
import { Textarea } from "@/components/Admin/adminblog/ui/Textarea";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });


// ---------------- Validation Schema ----------------
const BlogSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  category: z.string().min(1, "Category is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().url("Must be a valid URL").optional(),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string()).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    canonical: z.string().url("Must be a valid URL").optional(),
    robots: z.string().optional(),
    structuredData: z.string().optional(),
  }),
});

type BlogFormData = z.infer<typeof BlogSchema>;

interface OptionType {
  label: string;
  value: string;
}

interface BlogFormModalProps {
  blogId?: string;
  onSuccess?: () => void;
}

export default function BlogFormModal({ blogId, onSuccess }: BlogFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [tagsOptions, setTagsOptions] = useState<OptionType[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(BlogSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      excerpt: "",
      coverImage: "",
      status: "draft",
      tags: [],
      seo: { title: "", description: "", keywords: [], canonical: "", robots: "", structuredData: "" },
    },
  });

  // ---------------- Fetch Categories & Tags ----------------
  useEffect(() => {
    fetch("/api/admincategory")
      .then(res => res.json())
      .then(data => setCategories(data.map((c: any) => ({ label: c.name, value: c.name }))))
      .catch(() => setCategories([]));

    fetch("/api/admintag")
      .then(res => res.json())
      .then(data => setTagsOptions(data.map((t: any) => ({ label: t.name, value: t.name }))))
      .catch(() => setTagsOptions([]));
  }, []);

  // ---------------- Prefill Form for Editing ----------------
  useEffect(() => {
    if (!blogId) return;
    setLoading(true);

    fetch(`/api/adminblog/${blogId}`)
      .then(res => res.json())
      .then(data => {
        reset({
          title: data.title,
          content: data.content,
          category: data.category || "",
          excerpt: data.excerpt || "",
          coverImage: data.coverImage || "",
          status: data.status,
          tags: data.tags || [],
          seo: {
            title: data.seo?.title || "",
            description: data.seo?.description || "",
            keywords: data.seo?.keywords || [],
            canonical: data.seo?.canonical || "",
            robots: data.seo?.robots || "",
            structuredData: JSON.stringify(data.seo?.structuredData || "", null, 2),
          },
        });
      })
      .catch(() => toast.error("Failed to load blog for editing!"))
      .finally(() => setLoading(false));
  }, [blogId, reset]);

  // ---------------- ReactQuill Image Upload Handler ----------------
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/adminblog/upload-blogimg", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        const quill = (document.querySelector(".ql-editor") as any).__quill;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", data.url);
        quill.setSelection(range.index + 1);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Image upload failed");
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  };

  const selectMenuStyles = { menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) };

  // ---------------- Submit Handler ----------------
  const onSubmit = async (data: BlogFormData) => {
    try {
      if (data.seo.structuredData) {
        try {
          data.seo.structuredData = JSON.parse(data.seo.structuredData);
        } catch {
          toast.error("Structured Data must be valid JSON");
          return;
        }
      }

      const method = blogId ? "PUT" : "POST";
      const url = blogId ? `/api/adminblog/${blogId}` : "/api/adminblog";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save blog");

      toast.success(blogId ? "Blog updated successfully!" : "Blog created successfully!");
      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  if (loading) return <p>Loading blog data...</p>;

  // ---------------- Render ----------------
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-md border">
      {/* Title */}
      <div>
        <Label>Title *</Label>
        <Input {...register("title")} placeholder="Enter blog title" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      {/* Content */}
      <div>
        <Label>Content *</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <ReactQuill theme="snow" value={field.value} onChange={field.onChange} modules={modules} />
          )}
        />
        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
      </div>

      {/* Category */}
      <div>
        <Label>Category *</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <CreatableSelect<OptionType, false>
              {...field}
              options={categories}
              value={categories.find(c => c.value === field.value) || (field.value ? { label: field.value, value: field.value } : null)}
              onChange={(val: SingleValue<OptionType>) => {
                if (val) {
                  field.onChange(val.value);
                  if (!categories.find(c => c.value === val.value)) setCategories(prev => [...prev, val]);
                } else field.onChange("");
              }}
              placeholder="Select or type category"
              menuPortalTarget={document.body}
              styles={selectMenuStyles}
            />
          )}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <CreatableSelect<OptionType, true>
              isMulti
              options={tagsOptions}
              value={(field.value || []).map(v => ({ label: v, value: v }))}
              onChange={(vals: MultiValue<OptionType>) => {
                field.onChange(vals.map(v => v.value));
                vals.forEach(v => {
                  if (!tagsOptions.find(opt => opt.value === v.value)) setTagsOptions(prev => [...prev, v]);
                });
              }}
              placeholder="Select or type tags"
              menuPortalTarget={document.body}
              styles={selectMenuStyles}
            />
          )}
        />
      </div>

      {/* Excerpt */}
      <div>
        <Label>Excerpt</Label>
        <Controller name="excerpt" control={control} render={({ field }) => <Textarea {...field} rows={2} />} />
      </div>

      {/* Cover Image */}
      <div>
        <Label>Cover Image URL</Label>
        <Input {...register("coverImage")} placeholder="https://example.com/image.jpg" />
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        <select {...register("status")} className="border w-full px-3 py-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* SEO */}
      <h3 className="text-lg font-semibold mt-4">SEO Settings</h3>
      <div>
        <Label>Meta Title</Label>
        <Input {...register("seo.title")} />
      </div>
      <div>
        <Label>Meta Description</Label>
        <Controller name="seo.description" control={control} render={({ field }) => <Textarea {...field} rows={2} />} />
      </div>
      <div>
        <Label>Meta Keywords</Label>
        <Controller
          name="seo.keywords"
          control={control}
          render={({ field }) => (
            <CreatableSelect<OptionType, true>
              isMulti
              options={tagsOptions}
              value={(field.value || []).map(v => ({ label: v, value: v }))}
              onChange={(vals: MultiValue<OptionType>) => {
                field.onChange(vals.map(v => v.value));
                vals.forEach(v => {
                  if (!tagsOptions.find(opt => opt.value === v.value)) setTagsOptions(prev => [...prev, v]);
                });
              }}
              placeholder="Select or type keywords"
              menuPortalTarget={document.body}
              styles={selectMenuStyles}
            />
          )}
        />
      </div>
      <div>
        <Label>Canonical URL</Label>
        <Input {...register("seo.canonical")} />
      </div>
      <div>
        <Label>Robots</Label>
        <Input {...register("seo.robots")} />
      </div>
      <div>
        <Label>Structured Data (JSON)</Label>
        <Controller name="seo.structuredData" control={control} render={({ field }) => <Textarea {...field} rows={3} />} />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (blogId ? "Updating..." : "Saving...") : blogId ? "Update Blog" : "Save Blog"}
        </Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
