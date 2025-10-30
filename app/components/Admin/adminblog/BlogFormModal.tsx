// // ✅ Pagination with cursor → scalable for thousands of blogs
// // ✅ Debounced fetching → efficient API use
// // ✅ Live inline tag updates
// // ✅ Dynamic filters + sorting
// // ✅ Unified create/edit modal
// // ✅ Optimized UI using Tailwind + minimal re-renders


// "use client";

// import { useEffect, useState, useRef } from "react";
// import { toast } from "react-hot-toast";
// import { z } from "zod";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import CreatableSelect from "react-select/creatable";
// import { SingleValue, MultiValue } from "react-select";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import useSWR, { mutate } from "swr";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/Admin/adminblog/ui/Input";
// import { Label } from "@/components/Admin/adminblog/ui/Label";
// import { Textarea } from "@/components/Admin/adminblog/ui/Textarea";

// // ---------------- Validation Schema ----------------
// const BlogSchema = z.object({
//   title: z.string().min(3, "Title is required"),
//   content: z.string().min(10, "Content is required"),
//   category: z.string().optional(),
//   excerpt: z.string().optional(),
//   coverImage: z.string().url("Must be a valid URL").optional(),
//   status: z.enum(["draft", "published"]),
//   tags: z.array(z.string()).optional(),
//   seo: z.object({
//     title: z.string().optional(),
//     description: z.string().optional(),
//     keywords: z.array(z.string()).optional(),
//     canonical: z.string().url("Must be a valid URL").optional(),
//     robots: z.string().optional(),
//     structuredData: z.string().optional(),
//   }),
// });

// type BlogFormData = z.infer<typeof BlogSchema>;

// interface OptionType {
//   label: string;
//   value: string;
// }

// interface BlogFormModalProps {
//   blogId?: string;
//   onSuccess?: () => void;
// }

// // Reusable fetcher
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function BlogFormModal({ blogId, onSuccess }: BlogFormModalProps) {
//   const [categories, setCategories] = useState<OptionType[]>([]);
//   const [tagsOptions, setTagsOptions] = useState<OptionType[]>([]);
//   const [titleOptions, setTitleOptions] = useState<OptionType[]>([]);
//   const [titleInput, setTitleInput] = useState("");

//   // ---------------- React Hook Form Setup ----------------
//   const {
//     register,
//     handleSubmit,
//     reset,
//     control,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<BlogFormData>({
//     resolver: zodResolver(BlogSchema),
//     defaultValues: {
//       title: "",
//       content: "",
//       category: "",
//       excerpt: "",
//       coverImage: "",
//       status: "draft",
//       tags: [],
//       seo: { title: "", description: "", keywords: [], canonical: "", robots: "", structuredData: "" },
//     },
//   });

//   // ---------------- SWR: Fetch categories, tags, titles ----------------
//   const { data: filterData } = useSWR("/api/adminblog/frontendfetchblogs/filterblog", fetcher);  

//   useEffect(() => {
//     if (filterData) {
//       setCategories(filterData.categories?.map((c: string) => ({ label: c, value: c })) || []);
//       setTagsOptions(filterData.tags?.map((t: string) => ({ label: t, value: t })) || []);
//       setTitleOptions(filterData.titles?.map((t: string) => ({ label: t, value: t })) || []);
//     }
//   }, [filterData]);

//   // ---------------- SWR: Fetch blog for editing ----------------
//   const { data: blogData, error: blogError, isLoading: blogLoading } = useSWR(
//     blogId ? `/api/adminblog/${blogId}` : null,
//     fetcher
//   );

//   useEffect(() => {
//     if (blogData) {
//       reset({
//         title: blogData.title,
//         content: blogData.content,
//         category: blogData.category || "",
//         excerpt: blogData.excerpt || "",
//         coverImage: blogData.coverImage || "",
//         status: blogData.status,
//         tags: blogData.tags || [],
//         seo: {
//           title: blogData.seo?.title || "",
//           description: blogData.seo?.description || "",
//           keywords: blogData.seo?.keywords || [],
//           canonical: blogData.seo?.canonical || "",
//           robots: blogData.seo?.robots || "",
//           structuredData:
//             blogData.seo?.structuredData && typeof blogData.seo.structuredData === "object"
//               ? JSON.stringify(blogData.seo.structuredData, null, 2)
//               : blogData.seo?.structuredData || "",
//         },
//       });
//     }
//   }, [blogData, reset]);

//   // ---------------- Debounced Title Fetch ----------------
//   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

//   const fetchTitleOptions = (input: string) => {
//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

//     debounceTimeout.current = setTimeout(async () => {
//       try {
//         const res = await fetch(`/api/adminblog/frontendfetchblogs/filterblog?search=${input}`);
//         const data = await res.json();
//         const options = data.titles.map((t: string) => ({ label: t, value: t }));
//         setTitleOptions(options);
//       } catch (err) {
//         console.error("Failed to fetch titles", err);
//       }
//     }, 300);
//   };

//   // ---------------- Submit Handler (with SWR mutate) ----------------
//   const onSubmit = async (data: BlogFormData) => {
//     try {
//       // Validate structuredData JSON
//       if (data.seo.structuredData) {
//         try {
//           data.seo.structuredData = JSON.parse(data.seo.structuredData);
//         } catch {
//           toast.error("Structured Data must be valid JSON");
//           return;
//         }
//       } else {
//         delete data.seo.structuredData;
//       }

//       const method = blogId ? "PUT" : "POST";
//       const url = blogId ? `/api/adminblog/${blogId}` : "/api/adminblog";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) throw new Error("Failed to save blog");

//       toast.success(blogId ? "Blog updated successfully!" : "Blog created successfully!");

//      // ✅ Optimistic SWR update (update /api/adminblog list)
// mutate(
//   "/api/adminblog",
//   async (currentData: any) => {
//     // Normalize the current data in case it's not an array
//     const blogs = Array.isArray(currentData)
//       ? currentData
//       : currentData?.blogs || [];

//     const newBlog = { ...data, _id: blogId || Date.now().toString() };

//     if (blogId) {
//       // Update existing blog
//       return blogs.map((b: any) => (b._id === blogId ? newBlog : b));
//     }

//     // Add new blog
//     return [...blogs, newBlog];
//   },
//   false
// );


//       reset();
//       onSuccess?.();
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong!");
//     }
//   };

//   if (blogLoading) return <p>Loading blog data...</p>;
//   if (blogError) return <p>Error loading blog data.</p>;

//   const selectMenuStyles = { menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) };

//   // ---------------- Quill Config ----------------
//   const quillModules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ["bold", "italic", "underline", "strike"],
//       [{ list: "ordered" }, { list: "bullet" }],
//       ["blockquote", "code-block"],
//       ["link", "image"],
//       ["clean"],
//     ],
//   };

//   const quillFormats = [
//     "header",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "list",
//     "bullet",
//     "blockquote",
//     "code-block",
//     "link",
//     "image",
//   ];

//   // ---------------- UI ----------------
//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-md border">
//       {/* Title */}
//       <div>
//         <Label>Title *</Label>
//         <Controller
//           name="title"
//           control={control}
//           render={({ field }) => (
//             <CreatableSelect<OptionType, false>
//               {...field}
//               isClearable
//               options={titleOptions}
//               value={
//                 titleOptions.find((o) => o.value === field.value) ||
//                 (field.value ? { label: field.value, value: field.value } : null)
//               }
//               onInputChange={(inputValue) => {
//                 setTitleInput(inputValue);
//                 fetchTitleOptions(inputValue);
//               }}
//               onChange={(val: SingleValue<OptionType>) => field.onChange(val ? val.value : "")}
//               placeholder="Select or type title"
//               menuPortalTarget={document.body}
//               styles={selectMenuStyles}
//             />
//           )}
//         />
//         {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
//       </div>

//       {/* Content */}
//       <div>
//         <Label>Content *</Label>
//         <Controller
//           name="content"
//           control={control}
//           render={({ field }) => (
//             <div className="border rounded-lg overflow-hidden">
//               <ReactQuill
//                 value={field.value || ""}
//                 onChange={(val) => field.onChange(val)}
//                 modules={quillModules}
//                 formats={quillFormats}
//                 theme="snow"
//                 placeholder="Write your blog content here..."
//               />
//             </div>
//           )}
//         />
//         {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
//       </div>

//       {/* Category */}
//       <div>
//         <Label>Category</Label>
//         <Controller
//           name="category"
//           control={control}
//           render={({ field }) => (
//             <CreatableSelect<OptionType, false>
//               {...field}
//               options={categories}
//               value={
//                 categories.find((c) => c.value === field.value) ||
//                 (field.value ? { label: field.value, value: field.value } : null)
//               }
//               onChange={(val: SingleValue<OptionType>) => {
//                 if (val) {
//                   field.onChange(val.value);
//                   if (!categories.find((c) => c.value === val.value)) setCategories((prev) => [...prev, val]);
//                 } else field.onChange("");
//               }}
//               placeholder="Select or type category"
//               menuPortalTarget={document.body}
//               styles={selectMenuStyles}
//             />
//           )}
//         />
//       </div>

//       {/* Tags */}
//       <div>
//         <Label>Tags</Label>
//         <Controller
//           name="tags"
//           control={control}
//           render={({ field }) => (
//             <CreatableSelect<OptionType, true>
//               isMulti
//               options={tagsOptions}
//               value={(field.value || []).map((v) => ({ label: v, value: v }))}
//               onChange={(vals: MultiValue<OptionType>) => {
//                 field.onChange(vals.map((v) => v.value));
//                 vals.forEach((v) => {
//                   if (!tagsOptions.find((opt) => opt.value === v.value)) setTagsOptions((prev) => [...prev, v]);
//                 });
//               }}
//               placeholder="Select or type tags"
//               menuPortalTarget={document.body}
//               styles={selectMenuStyles}
//             />
//           )}
//         />
//       </div>

//       {/* Excerpt */}
//       <div>
//         <Label>Excerpt</Label>
//         <Controller name="excerpt" control={control} render={({ field }) => <Textarea {...field} rows={2} />} />
//       </div>

//       {/* Cover Image */}
//       <div>
//         <Label>Cover Image URL</Label>
//         <Input {...register("coverImage")} placeholder="https://example.com/image.jpg" />
//       </div>

//       {/* Upload Image */}
//       <div>
//         <Label>Or Upload Image</Label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={async (e) => {
//             const file = e.target.files?.[0];
//             if (!file) return;

//             const formData = new FormData();
//             formData.append("file", file);

//             try {
//               const res = await fetch("/api/adminblog/upload-blogimg", { method: "POST", body: formData });
//               const data = await res.json();
//               if (!res.ok) throw new Error(data.error || "Upload failed");

//               reset((prev) => ({ ...prev, coverImage: data.url }));
//               toast.success("Image uploaded successfully!");
//             } catch (err: any) {
//               console.error(err);
//               toast.error(err.message || "Image upload failed");
//             }
//           }}
//         />
//         {watch("coverImage") && (
//           <img src={watch("coverImage")} alt="Cover Preview" className="mt-2 w-40 h-40 object-cover rounded" />
//         )}
//       </div>

//       {/* Status */}
//       <div>
//         <Label>Status</Label>
//         <select {...register("status")} className="border w-full px-3 py-2 rounded">
//           <option value="draft">Draft</option>
//           <option value="published">Published</option>
//         </select>
//       </div>

//       {/* SEO */}
//       <h3 className="text-lg font-semibold mt-4">SEO Settings</h3>
//       <div>
//         <Label>Meta Title</Label>
//         <Input {...register("seo.title")} />
//       </div>
//       <div>
//         <Label>Meta Description</Label>
//         <Controller name="seo.description" control={control} render={({ field }) => <Textarea {...field} rows={2} />} />
//       </div>
//       <div>
//         <Label>Meta Keywords</Label>
//         <Controller
//           name="seo.keywords"
//           control={control}
//           render={({ field }) => (
//             <CreatableSelect<OptionType, true>
//               isMulti
//               options={tagsOptions}
//               value={(field.value || []).map((v) => ({ label: v, value: v }))}
//               onChange={(vals: MultiValue<OptionType>) => {
//                 field.onChange(vals.map((v) => v.value));
//                 vals.forEach((v) => {
//                   if (!tagsOptions.find((opt) => opt.value === v.value)) setTagsOptions((prev) => [...prev, v]);
//                 });
//               }}
//               placeholder="Select or type keywords"
//               menuPortalTarget={document.body}
//               styles={selectMenuStyles}
//             />
//           )}
//         />
//       </div>
//       <div>
//         <Label>Canonical URL</Label>
//         <Input {...register("seo.canonical")} />
//       </div>
//       <div>
//         <Label>Robots</Label>
//         <Input {...register("seo.robots")} />
//       </div>
//       <div>
//         <Label>Structured Data (JSON)</Label>
//         <Controller name="seo.structuredData" control={control} render={({ field }) => <Textarea {...field} rows={3} />} />
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-4">
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? (blogId ? "Updating..." : "Saving...") : blogId ? "Update Blog" : "Save Blog"}
//         </Button>
//         <Button type="button" variant="outline" onClick={() => reset()}>
//           Cancel
//         </Button>
//       </div>
//     </form>
//   );
// }

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CreatableSelect from "react-select/creatable";
import ReactQuill from "react-quill";
import useSWR, { mutate } from "swr";
import "react-quill/dist/quill.snow.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/Admin/adminblog/ui/Input";
import { Label } from "@/components/Admin/adminblog/ui/Label";
import { Textarea } from "@/components/Admin/adminblog/ui/Textarea";

// ---------------- Validation Schema ----------------
const BlogSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  category: z.string().optional(),
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

// ---------------- Fetcher ----------------
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlogFormModal({ blogId, onSuccess }: BlogFormModalProps) {
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [tagsOptions, setTagsOptions] = useState<OptionType[]>([]);
  const [titleOptions, setTitleOptions] = useState<OptionType[]>([]);

  // ---------------- Form Setup ----------------
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
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

  // ---------------- Fetch Filters ----------------
  const { data: filterData } = useSWR("/api/adminblog/frontendfetchblogs/filterblog", fetcher);

  useEffect(() => {
    if (filterData) {
      setCategories(filterData.categories?.map((c: string) => ({ label: c, value: c })) || []);
      setTagsOptions(filterData.tags?.map((t: string) => ({ label: t, value: t })) || []);
      setTitleOptions(filterData.titles?.map((t: string) => ({ label: t, value: t })) || []);
    }
  }, [filterData]);

  // ---------------- Fetch Blog (Edit Mode) ----------------
  const { data: blogData, error: blogError, isLoading } = useSWR(blogId ? `/api/adminblog/${blogId}` : null, fetcher);

  useEffect(() => {
    if (blogData) {
      reset({
        title: blogData.title || "",
        content: blogData.content || "",
        category: blogData.category || "",
        excerpt: blogData.excerpt || "",
        coverImage: blogData.coverImage || "",
        status: blogData.status || "draft",
        tags: blogData.tags || [],
        seo: {
          title: blogData.seo?.title || "",
          description: blogData.seo?.description || "",
          keywords: blogData.seo?.keywords || [],
          canonical: blogData.seo?.canonical || "",
          robots: blogData.seo?.robots || "",
          structuredData: blogData.seo?.structuredData
            ? JSON.stringify(blogData.seo.structuredData, null, 2)
            : "",
        },
      });
    }
  }, [blogData, reset]);

  // ---------------- Debounced Title Fetch ----------------
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchTitleOptions = useCallback((input: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/adminblog/frontendfetchblogs/filterblog?search=${input}`);
        const data = await res.json();
        setTitleOptions(data.titles?.map((t: string) => ({ label: t, value: t })) || []);
      } catch {
        console.warn("Failed to fetch title suggestions");
      }
    }, 300);
  }, []);

  // ---------------- Submit Handler ----------------
  const onSubmit = async (data: BlogFormData) => {
    try {
      // Validate JSON structuredData
      if (data.seo.structuredData) {
        try {
          data.seo.structuredData = JSON.parse(data.seo.structuredData);
        } catch {
          toast.error("Structured Data must be valid JSON");
          return;
        }
      }

      const method = blogId ? "PUT" : "POST";
      const res = await fetch(blogId ? `/api/adminblog/${blogId}` : "/api/adminblog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save blog");

      toast.success(blogId ? "Blog updated successfully!" : "Blog created successfully!");

      // Optimistic SWR Update
      mutate("/api/adminblog", async (curr: any) => {
        const list = Array.isArray(curr) ? curr : curr?.blogs || [];
        const newBlog = { ...data, _id: blogId || Date.now().toString() };
        return blogId
          ? list.map((b: any) => (b._id === blogId ? newBlog : b))
          : [...list, newBlog];
      }, false);

      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving!");
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading blog data...</p>;
  if (blogError) return <p className="text-red-500">Error loading blog data.</p>;

  // ---------------- UI ----------------
  const selectMenuStyles = { menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
    >
      {/* Title */}
      <div>
        <Label>Title *</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              {...field}
              isClearable
              options={titleOptions}
              value={
                titleOptions.find((o) => o.value === field.value) ||
                (field.value ? { label: field.value, value: field.value } : null)
              }
              onInputChange={fetchTitleOptions}
              onChange={(val) => field.onChange(val?.value || "")}
              placeholder="Select or type title"
              menuPortalTarget={document.body}
              styles={selectMenuStyles}
            />
          )}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      {/* Content */}
      <div>
        <Label>Content *</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <div className="border rounded-lg overflow-hidden">
              <ReactQuill
                value={field.value}
                onChange={field.onChange}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                placeholder="Write your blog content here..."
              />
            </div>
          )}
        />
        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              {...field}
              options={categories}
              value={
                categories.find((c) => c.value === field.value) ||
                (field.value ? { label: field.value, value: field.value } : null)
              }
              onChange={(val) => {
                if (val && !categories.some((c) => c.value === val.value)) {
                  setCategories((prev) => [...prev, val]);
                }
                field.onChange(val?.value || "");
              }}
              placeholder="Select or type category"
              menuPortalTarget={document.body}
              styles={selectMenuStyles}
            />
          )}
        />
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              isMulti
              options={tagsOptions}
              value={(field.value || []).map((v) => ({ label: v, value: v }))}
              onChange={(vals) => {
                const newTags = vals.map((v) => v.value);
                field.onChange(newTags);
                vals.forEach((v) => {
                  if (!tagsOptions.some((opt) => opt.value === v.value))
                    setTagsOptions((prev) => [...prev, v]);
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
        {watch("coverImage") && (
          <img src={watch("coverImage")} alt="Cover Preview" className="mt-2 w-40 h-40 object-cover rounded" />
        )}
      </div>

      {/* Upload Image */}
      <div>
        <Label>Or Upload Image</Label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            try {
              const res = await fetch("/api/adminblog/upload-blogimg", { method: "POST", body: formData });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Upload failed");
              reset((prev) => ({ ...prev, coverImage: data.url }));
              toast.success("Image uploaded successfully!");
            } catch (err: any) {
              toast.error(err.message || "Image upload failed");
            }
          }}
        />
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        <select {...register("status")} className="border w-full px-3 py-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* SEO Section */}
      <h3 className="text-lg font-semibold mt-4 border-b pb-1">SEO Settings</h3>
      {["seo.title", "seo.description", "seo.keywords", "seo.canonical", "seo.robots", "seo.structuredData"].map(
        (key) => (
          <div key={key}>
            <Label>{key.split(".")[1].replace(/^\w/, (c) => c.toUpperCase())}</Label>
            {key.includes("description") || key.includes("structuredData") ? (
              <Controller name={key as any} control={control} render={({ field }) => <Textarea {...field} rows={2} />} />
            ) : key.includes("keywords") ? (
              <Controller
                name={key as any}
                control={control}
                render={({ field }) => (
                  <CreatableSelect
                    isMulti
                    options={tagsOptions}
                    value={(field.value || []).map((v: any) => ({ label: v, value: v }))}
                    onChange={(vals) => field.onChange(vals.map((v) => v.value))}
                    placeholder="Enter SEO keywords"
                    menuPortalTarget={document.body}
                    styles={selectMenuStyles}
                  />
                )}
              />
            ) : (
              <Input {...register(key as any)} />
            )}
          </div>
        )
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
