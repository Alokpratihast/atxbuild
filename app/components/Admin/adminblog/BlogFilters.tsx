"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BlogFilters() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 flex-wrap">
      <Input
        placeholder="Search blogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1"
      />

      <select
        className="border rounded-lg px-3 py-2"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="title-asc">Title A–Z</option>
        <option value="title-desc">Title Z–A</option>
      </select>

      <Button onClick={() => console.log({ search, sort })}>Apply</Button>
    </div>
  );
}
