
//\Atxgitclone\atxbuild\app\api\adminblog\frontendfetchblogs\filterblog\route.ts//

import { NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";

export async function GET() {
  try {
    await connectedToDatabase();

    const [categories, tags, titles] = await Promise.all([
      Blog.distinct("category"),
      Blog.distinct("tags"),
      Blog.distinct("title"),
    ]);

    return NextResponse.json({
      categories: categories.filter(Boolean),
      tags: tags.filter(Boolean),
      titles: titles.filter(Boolean),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
