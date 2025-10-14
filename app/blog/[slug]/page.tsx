import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/models/blogdata";
import { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = blogs.find((b) => b.slug === params.slug);

  if (!blog) {
    return {
      title: "Blog - ATX Technologies",
      description: "Read articles on ATX Technologies",
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    };
  }

  return {
    title: blog.title,
    description: blog.desc,
    openGraph: {
      title: blog.title,
      description: blog.desc,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${blog.slug}`,
      images: blog.image ? [{ url: blog.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.desc,
      images: blog.image ? [{ url: blog.image }] : [],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  };
}

// 

export default function BlogDetailPage({ params }: Props) {
  // Find blog by slug
  const blog = blogs.find((b) => b.slug === params.slug);
  if (!blog) notFound();

  // Calculate reading time
  const wordsPerMinute = 200;
  const textLength = blog.desc.split(" ").length;
  const readingTime = Math.ceil(textLength / wordsPerMinute);

  // Related articles (exclude current)
  const related = blogs.filter((b) => b.slug !== blog.slug).slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <nav className="flex flex-wrap items-center text-sm text-gray-500 gap-2" aria-label="Breadcrumb">
          <Link href="/" className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-600 transition">
            🏠 Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/blog" className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-600 transition">
            Blog
          </Link>
          <span className="text-gray-300">/</span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
            {blog.title.length > 40 ? blog.title.slice(0, 40) + "..." : blog.title}
          </span>
        </nav>
      </div>

      {/* Blog Header */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="relative w-full h-80 md:h-[400px] rounded-2xl overflow-hidden shadow-lg mb-6">
          <Image src={blog.image} alt={blog.title} fill className="object-cover" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{blog.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-6">
          <span>📅 {new Date(blog.date).toLocaleDateString()}</span>
          <span>•</span>
          <span>⌛ {readingTime} min read</span>
        </div>

        {/* Blog Content */}
        <article className="prose max-w-full text-gray-700 mb-12">
          <p className="mb-4">{blog.desc}</p>
          {blog.content.map((block, index) => {
            switch (block.type) {
              case "h2":
                return <h2 key={index} className="mt-6 mb-3 text-2xl font-semibold">{block.text}</h2>;
              case "h3":
                return <h3 key={index} className="mt-5 mb-2 text-xl font-medium">{block.text}</h3>;
              case "p":
                return <p key={index} className="mb-4">{block.text}</p>;
              case "ul":
                return (
                  block.items ? (
                    <ul key={index} className="list-disc pl-6 mb-4">
                      {block.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : null
                );
              default:
                return null;
            }
          })}
        </article>

        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-block mb-12 px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
        >
          ← Back to Blog
        </Link>

        {/* Related Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`}>
                <div className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition cursor-pointer">
                  <div className="relative w-full h-40">
                    <Image src={r.image} alt={r.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 text-gray-900">{r.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {r.desc.length > 80 ? r.desc.slice(0, 80) + "..." : r.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
