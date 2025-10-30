"use client";

import { Button } from "@/components/ui/button";

interface BlogBulkActionsProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export default function BlogBulkActions({
  count,
  onDelete,
  onClear,
}: BlogBulkActionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
      <p>
        {count} selected
      </p>
      <div className="flex gap-3">
        <Button variant="destructive" onClick={onDelete}>
          Delete Selected
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear Selection
        </Button>
      </div>
    </div>
  );
}
